import asyncio
import io
import json
import logging
from contextlib import asynccontextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any

import warnings
warnings.filterwarnings("ignore", category=FutureWarning, module="transformers")

try:
    from fastapi import FastAPI, File, HTTPException, UploadFile
    from fastapi.middleware.cors import CORSMiddleware
    FASTAPI_AVAILABLE = True
except ImportError:  # pragma: no cover - exercised in minimal environments
    FASTAPI_AVAILABLE = False

    class HTTPException(Exception):
        def __init__(self, status_code: int, detail: str | None = None):
            super().__init__(detail)
            self.status_code = status_code
            self.detail = detail

    class UploadFile:  # pragma: no cover - fallback only
        pass

    def File(default: Any):
        return default

    class CORSMiddleware:  # pragma: no cover - fallback only
        def __init__(self, *args: Any, **kwargs: Any):
            pass

    class FallbackFastAPI:  # pragma: no cover - fallback only
        def __init__(self, title: str = "API", lifespan=None, **kwargs: Any):
            self.title = title
            self.lifespan = lifespan
            self.routes = []
            self.middlewares = []

        def add_middleware(self, middleware_cls: Any, *args: Any, **kwargs: Any):
            self.middlewares.append((middleware_cls, args, kwargs))

        def get(self, path: str):
            def decorator(func):
                self.routes.append(("GET", path, func))
                return func

            return decorator

        def post(self, path: str):
            def decorator(func):
                self.routes.append(("POST", path, func))
                return func

            return decorator

    FastAPI = FallbackFastAPI

try:
    import torch
    from PIL import Image
    from transformers import AutoImageProcessor, AutoModelForImageClassification
except ImportError:  
    torch = None
    Image = None
    AutoImageProcessor = None
    AutoModelForImageClassification = None

from treatments import get_treatment, split_label

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("crop-doctor")
logger.warning("FastAPI/uvicorn not available; using built-in fallback server.")

MODEL_NAME = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"

MAX_UPLOAD_BYTES = 8 * 1024 * 1024  
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
LOW_CONFIDENCE_THRESHOLD = 50.0  


processor = None
model = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global processor, model
    if torch is None or Image is None or AutoImageProcessor is None or AutoModelForImageClassification is None:
        logger.warning("Skipping model load because optional ML dependencies are unavailable.")
        yield
        return

    logger.info("Loading model %s ...", MODEL_NAME)
    try:
        processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
        model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)
        model.eval()
        logger.info("Model loaded. %d classes.", model.config.num_labels)
    except Exception as exc:  # pragma: no cover - depends on network/cache availability
        logger.warning("Model could not be loaded: %s", exc)
        processor = None
        model = None
        logger.warning("Diagnosis will remain unavailable until a compatible model can be loaded.")
    yield


app = FastAPI(title="Crop Doctor API", lifespan=lifespan)

# Allow the Vite dev server (and any frontend) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class FallbackRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self._dispatch("GET")

    def do_POST(self):
        self._dispatch("POST")

    def _dispatch(self, method: str):
        path = self.path.split("?", 1)[0]
        for route_method, route_path, handler in getattr(app, "routes", []):
            if route_method == method and route_path == path:
                try:
                    if asyncio.iscoroutinefunction(handler):
                        result = asyncio.run(handler())
                    else:
                        result = handler()
                    self._send_json(result, 200)
                except HTTPException as exc:
                    self._send_json({"detail": exc.detail}, exc.status_code)
                except Exception as exc:  # pragma: no cover - defensive fallback
                    self._send_json({"detail": str(exc)}, 500)
                return

        self._send_json({"detail": "Not Found"}, 404)

    def _send_json(self, payload: Any, status_code: int):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args: Any):
        return


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/diagnose")
async def diagnose(file: UploadFile = File(...)):
    if model is None or processor is None or Image is None or torch is None:
        raise HTTPException(status_code=503, detail="Model is unavailable right now, please try again shortly.")

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Please upload a JPEG, PNG, or WEBP image.",
        )

    raw_bytes = await file.read()

    if len(raw_bytes) == 0:
        raise HTTPException(status_code=400, detail="That file is empty.")
    if len(raw_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Image is too large — keep it under {MAX_UPLOAD_BYTES // (1024 * 1024)} MB.",
        )

    try:
        image = Image.open(io.BytesIO(raw_bytes))
        image.verify()  # cheap check that this is actually a valid image file
        image = Image.open(io.BytesIO(raw_bytes)).convert("RGB")  # re-open: verify() consumes the file
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read that image file — is it corrupted?")

    inputs = processor(images=image, return_tensors="pt")

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probs = torch.nn.functional.softmax(logits, dim=-1)[0]

    top_probs, top_indices = torch.topk(probs, k=3)

    predictions = []
    for prob, idx in zip(top_probs.tolist(), top_indices.tolist()):
        raw_label = model.config.id2label[idx]
        crop, disease, is_healthy = split_label(raw_label)
        predictions.append(
            {
                "raw_label": raw_label,
                "crop": crop,
                "disease": disease,
                "is_healthy": is_healthy,
                "confidence": round(prob * 100, 1),
            }
        )

    top = predictions[0]
    treatment = get_treatment(top["raw_label"])

    return {
        "crop": top["crop"],
        "disease": top["disease"],
        "is_healthy": top["is_healthy"],
        "confidence": top["confidence"],
        "low_confidence": top["confidence"] < LOW_CONFIDENCE_THRESHOLD,
        "treatment": treatment,
        "alternatives": predictions[1:],
    }


def run_server():
    if FASTAPI_AVAILABLE:
        import uvicorn

        uvicorn.run(app, host="0.0.0.0", port=8000)
        return

    server = ThreadingHTTPServer(("0.0.0.0", 8000), FallbackRequestHandler)
    logger.info("Falling back to built-in HTTP server on http://0.0.0.0:8000")
    server.serve_forever()


if __name__ == "__main__":
    run_server()