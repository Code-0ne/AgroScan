import io
import logging
import uvicorn
import torch
import httpx
from fastapi import FastAPI, File, HTTPException, UploadFile, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from PIL import Image
from transformers import AutoModelForImageClassification, MobileNetV2ImageProcessor
from treatments import get_treatment, split_label
from advisory import build_advisory 

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agro-scan")
 
MODEL_NAME = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"
 
MAX_UPLOAD_BYTES = 8 * 1024 * 1024  
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
LOW_CONFIDENCE_THRESHOLD = 50.0  
 

processor = None
model = None
 
 
@asynccontextmanager
async def lifespan(app: FastAPI):
    global processor, model
    logger.info("Loading model %s ...", MODEL_NAME)

    processor = MobileNetV2ImageProcessor.from_pretrained(MODEL_NAME)
    model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)
    model.eval()
    logger.info("Model loaded. %d classes.", model.config.num_labels)
    yield
    del model
    del processor
  
app = FastAPI(title="AgroScan", lifespan=lifespan)
 
@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}
 
@app.post("/diagnose")
async def diagnose(file: UploadFile = File(...)):
    if model is None or processor is None:
        raise HTTPException(status_code=503, detail="Model is still loading, try again shortly.")
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
        image.verify()  #
        image = Image.open(io.BytesIO(raw_bytes)).convert("RGB") 
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read that image file — is it corrupted?")
 
    inputs = processor(images=image, return_tensors="pt")
 
    with torch.no_grad():
       
        device = next(model.parameters()).device
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
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

@app.get("/advisory")
async def advisory(
    crop: str = Query(..., description="Crop name, e.g. 'Tomato'"),
    is_healthy: bool = Query(False),
    latitude: float = Query(..., description="Farm latitude"),
    longitude: float = Query(..., description="Farm longitude"),
):
    """Weather-aware irrigation/fertilizer/spray advisory for a diagnosed crop.
    Pulls a short-range forecast from Open-Meteo (free, no API key) and
    combines it with the diagnosis via simple rule-based logic."""
    async with httpx.AsyncClient(timeout=10) as client:
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
        except Exception as exc:
            logger.warning("Weather fetch failed: %s", exc)
            raise HTTPException(status_code=502, detail="Could not reach the weather service.")
 
    return build_advisory(crop=crop, is_healthy=is_healthy, forecast=forecast)

def run_server():
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    run_server()