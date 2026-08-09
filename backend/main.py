import io
import logging
import asyncio
import time
import magic
import os
from contextlib import asynccontextmanager
from functools import lru_cache

import torch
import httpx
from fastapi import FastAPI, File, HTTPException, UploadFile, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
from transformers import AutoModelForImageClassification, MobileNetV2ImageProcessor
from backend.treatments import get_treatment, split_label
from backend.advisory import build_advisory
from backend.leaf_check import is_leaf_image

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s"
)
logger = logging.getLogger("agro-scan")

MODEL_NAME = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"
MAX_UPLOAD_BYTES = 8 * 1024 * 1024
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
LOW_CONFIDENCE_THRESHOLD = 50.0
MODEL_LOAD_TIMEOUT = 60

processor = None
model = None
model_ready = asyncio.Event()
model_load_error = None

app = FastAPI(title="AgroScan", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173", "http://127.0.0.1:5173", "http://127.0.0.1:4173"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Serve frontend static files in production
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")


def _load_model():
    global processor, model, model_load_error
    try:
        logger.info("Loading model %s ...", MODEL_NAME)
        processor = MobileNetV2ImageProcessor.from_pretrained(MODEL_NAME)
        model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)
        model.eval()
        logger.info("Model loaded. %d classes.", model.config.num_labels)
    except Exception as e:
        model_load_error = e
        logger.exception("Model loading failed")
        raise


@asynccontextmanager
async def lifespan(app: FastAPI):
    loop = asyncio.get_event_loop()
    load_task = loop.run_in_executor(None, _load_model)
    try:
        await asyncio.wait_for(load_task, timeout=MODEL_LOAD_TIMEOUT)
        model_ready.set()
    except asyncio.TimeoutError:
        model_load_error = TimeoutError(f"Model load exceeded {MODEL_LOAD_TIMEOUT}s")
        logger.error("Model load timeout")
    yield
    global processor, model
    del model
    del processor
    model = None
    processor = None
    model_ready.clear()


app.router.lifespan_context = lifespan


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(time.time_ns()))
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time-MS"] = f"{duration_ms:.1f}"
    logger.info("%s %s %.1fms %d", request.method, request.url.path, duration_ms, response.status_code)
    return response


@app.get("/health")
def health():
    return {
        "status": "ok" if model_ready.is_set() else "loading",
        "model_loaded": model is not None,
        "model_ready": model_ready.is_set(),
        "model_error": str(model_load_error) if model_load_error else None,
    }


async def _ensure_model_ready():
    if model_load_error:
        raise HTTPException(503, f"Model failed to load: {model_load_error}")
    if not model_ready.is_set():
        try:
            await asyncio.wait_for(model_ready.wait(), timeout=30)
        except asyncio.TimeoutError:
            raise HTTPException(503, "Model still loading")


def _validate_image(raw_bytes: bytes) -> str:
    mime = magic.from_buffer(raw_bytes, mime=True)
    if mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(400, f"Invalid file type: {mime}. Allowed: JPEG, PNG, WEBP")
    return mime


@app.post("/diagnose")
async def diagnose(file: UploadFile = File(...)):
    await _ensure_model_ready()

    raw_bytes = await file.read()
    if not raw_bytes:
        raise HTTPException(400, "Empty file")
    if len(raw_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, f"File too large (max {MAX_UPLOAD_BYTES // (1024 * 1024)} MB)")

    _validate_image(raw_bytes)

    if not is_leaf_image(raw_bytes):
        raise HTTPException(
            422,
            "This doesn't look like a leaf photo — please upload a clear, close-up photo of a single plant leaf."
        )

    try:
        image = Image.open(io.BytesIO(raw_bytes))
        image.verify()
        image = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(400, "Corrupted or unsupported image")

    inputs = processor(images=image, return_tensors="pt")
    device = next(model.parameters()).device
    inputs = {k: v.to(device) for k, v in inputs.items()}

    loop = asyncio.get_event_loop()
    with torch.no_grad():
        outputs = await loop.run_in_executor(None, lambda: model(**inputs))
    logits = outputs.logits
    probs = torch.nn.functional.softmax(logits, dim=-1)[0]

    top_probs, top_indices = torch.topk(probs, k=3)

    predictions = []
    for prob, idx in zip(top_probs.tolist(), top_indices.tolist()):
        raw_label = model.config.id2label[idx]
        crop, disease, is_healthy = split_label(raw_label)
        predictions.append({
            "raw_label": raw_label,
            "crop": crop,
            "disease": disease,
            "is_healthy": is_healthy,
            "confidence": round(prob * 100, 1),
        })

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


@app.get("/advisory")
async def advisory(
    crop: str = Query(..., description="Crop name, e.g. 'Tomato'"),
    is_healthy: bool = Query(False),
    latitude: float = Query(..., description="Farm latitude"),
    longitude: float = Query(..., description="Farm longitude"),
):
    await _ensure_model_ready()

    async with httpx.AsyncClient(timeout=8) as client:
        try:
            resp = await client.get(
                "https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": latitude,
                    "longitude": longitude,
                    "daily": "precipitation_sum,temperature_2m_max,relative_humidity_2m_mean",
                    "forecast_days": 3,
                    "timezone": "auto",
                },
            )
            resp.raise_for_status()
            forecast = resp.json()
        except httpx.TimeoutException:
            raise HTTPException(504, "Weather service timeout")
        except httpx.HTTPStatusError as e:
            logger.warning("Weather API error: %s", e)
            raise HTTPException(502, "Weather service unavailable")
        except Exception as e:
            logger.warning("Weather fetch failed: %s", e)
            raise HTTPException(502, "Could not reach weather service")

    return build_advisory(crop=crop, is_healthy=is_healthy, forecast=forecast)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error: %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)