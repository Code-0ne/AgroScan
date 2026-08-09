from PIL import Image
import numpy as np


def is_leaf_image(raw_bytes: bytes, min_plant_fraction: float = 0.08) -> bool:
    """
    Fast heuristic: reject images that don't contain enough plant-colored pixels.
    Runs before the model to prevent forced misclassification of non-leaf photos.
    """
    try:
        img = Image.open(io.BytesIO(raw_bytes))
        img.verify()
        img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    except Exception:
        return False

    img = img.resize((160, 160))
    arr = np.array(img, dtype=np.uint8)

    hsv = np.empty_like(arr, dtype=np.float32)
    r, g, b = arr[..., 0] / 255.0, arr[..., 1] / 255.0, arr[..., 2] / 255.0
    cmax = np.maximum(np.maximum(r, g), b)
    cmin = np.minimum(np.minimum(r, g), b)
    delta = cmax - cmin

    hue = np.zeros_like(cmax)
    mask = delta > 0
    rc = (cmax == r) & mask
    gc = (cmax == g) & mask
    bc = (cmax == b) & mask
    hue[rc] = (60 * ((g[rc] - b[rc]) / delta[rc]) + 360) % 360
    hue[gc] = (60 * ((b[gc] - r[gc]) / delta[gc]) + 120) % 360
    hue[bc] = (60 * ((r[bc] - g[bc]) / delta[bc]) + 240) % 360

    saturation = np.zeros_like(cmax)
    saturation[mask] = delta[mask] / cmax[mask]
    value = cmax

    sat_threshold = 0.15
    val_threshold = 0.15

    green_mask = (hue >= 60) & (hue <= 160) & (saturation >= sat_threshold) & (value >= val_threshold)
    yellow_mask = (hue >= 25) & (hue <= 55) & (saturation >= sat_threshold) & (value >= val_threshold)
    brown_mask = (hue >= 10) & (hue <= 35) & (saturation >= 0.1) & (value >= 0.12) & (value <= 0.7)

    plant_mask = green_mask | yellow_mask | brown_mask
    plant_fraction = float(plant_mask.mean())

    return plant_fraction >= min_plant_fraction


def is_leaf_image_detailed(raw_bytes: bytes) -> tuple[bool, dict]:
    """
    Returns (is_leaf, details_dict) for debugging/logging.
    """
    try:
        img = Image.open(io.BytesIO(raw_bytes))
        img.verify()
        img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    except Exception as e:
        return False, {"error": str(e)}

    img = img.resize((160, 160))
    arr = np.array(img, dtype=np.uint8)

    hsv = np.empty_like(arr, dtype=np.float32)
    r, g, b = arr[..., 0] / 255.0, arr[..., 1] / 255.0, arr[..., 2] / 255.0
    cmax = np.maximum(np.maximum(r, g), b)
    cmin = np.minimum(np.minimum(r, g), b)
    delta = cmax - cmin

    hue = np.zeros_like(cmax)
    mask = delta > 0
    rc = (cmax == r) & mask
    gc = (cmax == g) & mask
    bc = (cmax == b) & mask
    hue[rc] = (60 * ((g[rc] - b[rc]) / delta[rc]) + 360) % 360
    hue[gc] = (60 * ((b[gc] - r[gc]) / delta[gc]) + 120) % 360
    hue[bc] = (60 * ((r[bc] - g[bc]) / delta[bc]) + 240) % 360

    saturation = np.zeros_like(cmax)
    saturation[mask] = delta[mask] / cmax[mask]
    value = cmax

    sat_threshold = 0.15
    val_threshold = 0.15

    green_mask = (hue >= 60) & (hue <= 160) & (saturation >= sat_threshold) & (value >= val_threshold)
    yellow_mask = (hue >= 25) & (hue <= 55) & (saturation >= sat_threshold) & (value >= val_threshold)
    brown_mask = (hue >= 10) & (hue <= 35) & (saturation >= 0.1) & (value >= 0.12) & (value <= 0.7)

    plant_mask = green_mask | yellow_mask | brown_mask
    plant_fraction = float(plant_mask.mean())

    details = {
        "plant_fraction": round(plant_fraction, 4),
        "green_fraction": round(float(green_mask.mean()), 4),
        "yellow_fraction": round(float(yellow_mask.mean()), 4),
        "brown_fraction": round(float(brown_mask.mean()), 4),
        "threshold": 0.08,
    }

    return plant_fraction >= 0.08, details


import io