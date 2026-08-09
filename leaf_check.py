from PIL import Image
import numpy as np
import io


def _rgb_to_hsv(arr: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Convert RGB [0,1] arrays to HSV. Returns (hue, saturation, value)."""
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
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
    return hue, saturation, value


def _plant_masks(hue: np.ndarray, saturation: np.ndarray, value: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Return (green_mask, yellow_mask, brown_mask) for plant-colored pixels."""
    sat_thresh = 0.15
    val_thresh = 0.15

    green = (hue >= 60) & (hue <= 160) & (saturation >= sat_thresh) & (value >= val_thresh)
    yellow = (hue >= 25) & (hue <= 55) & (saturation >= sat_thresh) & (value >= val_thresh)
    brown = (hue >= 10) & (hue <= 35) & (saturation >= 0.1) & (value >= 0.12) & (value <= 0.7)
    return green, yellow, brown


def _analyze_image(raw_bytes: bytes) -> tuple[float, dict]:
    """Return (plant_fraction, details_dict) for an image."""
    try:
        img = Image.open(io.BytesIO(raw_bytes))
        img.verify()
        img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    except Exception:
        return 0.0, {"error": "invalid_image"}

    img = img.resize((160, 160))
    arr = np.array(img, dtype=np.float32) / 255.0

    hue, saturation, value = _rgb_to_hsv(arr)
    green, yellow, brown = _plant_masks(hue, saturation, value)

    plant_mask = green | yellow | brown
    plant_fraction = float(plant_mask.mean())

    details = {
        "plant_fraction": round(plant_fraction, 4),
        "green_fraction": round(float(green.mean()), 4),
        "yellow_fraction": round(float(yellow.mean()), 4),
        "brown_fraction": round(float(brown.mean()), 4),
        "threshold": 0.08,
    }
    return plant_fraction, details


def is_leaf_image(raw_bytes: bytes, min_plant_fraction: float = 0.08) -> bool:
    """Fast check: does this image contain enough plant-colored pixels?"""
    plant_fraction, _ = _analyze_image(raw_bytes)
    return plant_fraction >= min_plant_fraction


def is_leaf_image_detailed(raw_bytes: bytes) -> tuple[bool, dict]:
    """Detailed check with breakdown for debugging."""
    plant_fraction, details = _analyze_image(raw_bytes)
    return plant_fraction >= 0.08, details