# AgroScan

Pest/disease identification from a leaf photo: React frontend → FastAPI backend →
MobileNetV2 (fine-tuned on PlantVillage, 38 classes) → treatment lookup + weather advisory.

## Model & Dataset

AgroScan utilizes a **MobileNetV2** architecture, specifically the model `linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification` from Hugging Face.

- **Dataset**: The model is fine-tuned on the **PlantVillage** dataset, a comprehensive open-access database of healthy and diseased crop leaves.
- **Capabilities**: It can identify **38 different conditions** across various crops including Tomato, Potato, Corn, Apple, Grape, and more.
- **Input**: Images are preprocessed to 224×224 pixels and normalized before inference.

## Backend

Uses [uv](https://docs.astral.sh/uv/) for dependency management — no manual
venv step needed, `uv run` creates and reuses one automatically based on
`pyproject.toml`.

```bash
cd backend
uv sync
uv run main.py
```

That first command resolves and installs dependencies into `.venv` (creating
`uv.lock` alongside `pyproject.toml`), then starts the server. Subsequent
runs reuse the lockfile and are fast.

The model itself downloads from Hugging Face on first startup (a few hundred
MB) and is cached locally after that — separate from the `uv` dependency
cache.

Check it's alive: `curl http://localhost:8000/health`

If you don't have `uv` yet: `curl -LsSf https://astral.sh/uv/install.sh | sh`
(macOS/Linux) or see the [install docs](https://docs.astral.sh/uv/getting-started/installation/)
for Windows.

### Key Backend Features

- **Non-blocking model load** — starts server immediately, loads MobileNetV2 in background; `/health` reports `model_ready` status
- **Leaf pre-check (HSV heuristic)** — rejects non-leaf uploads (people, objects) with 422 before model inference
- **Async inference** — runs PyTorch forward pass in thread pool to avoid blocking the event loop
- **Real MIME validation** — `python-magic` inspects file bytes, not just `content_type` header
- **CORS enabled** — allows `localhost:5173`, `localhost:4173` for local dev
- **Structured logging** — `X-Request-ID`, response timing on every request
- **Weather advisory** — `/advisory` endpoint fetches Open-Meteo 3-day forecast and returns irrigation/fertilizer/disease-risk recommendations

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — Vite proxies `/api/*` to `http://localhost:8000/*`
(see `vite.config.js`), so no CORS setup is needed in dev beyond what's already
in `main.py`.

### Animation Engine (Framer Motion)

- **Magnetic micro-physics** — buttons & dropzone pull toward cursor via `useMotionValue` + `useTransform`
- **Liquid glass dropzone** — refraction borders (`1px rgba(255,255,255,0.1)`), inner shadow, diffusion shadow, backdrop blur
- **Spring physics everywhere** — `stiffness: 100, damping: 20` on all interactive elements
- **Confidence ring** — spring-animated progress with perpetual pulse on low confidence
- **StaggerChildren** — waterfall reveals on treatments, alternatives, advisory items (0.06–0.08s)
- **Layout transitions** — `layout` / `layoutId` on theme toggle, cards, confidence ring
- **Skeletal shimmer loaders** — layout-matched placeholders replace static boxes
- **Scan animation** — Framer Motion (fixes RAF layout thrashing from prior CSS approach)

## How a request flows

1. User drops/selects a leaf photo in the browser.
2. Frontend POSTs it as `multipart/form-data` to `POST /diagnose`.
3. Backend validates MIME type via `python-magic`, runs HSV leaf check (rejects 422 if <8% plant-colored pixels).
4. Opens image with Pillow, runs it through Hugging Face `AutoImageProcessor` (resize to 224×224, normalize) then the model.
5. Softmax over the 38 logits gives class probabilities; top-3 are kept.
6. The top class's raw label (e.g. `Tomato___Late_blight`) is split into
   crop + disease and looked up in `treatments.py` for organic/chemical
   suggestions.
7. JSON response → React renders the diagnosis card, confidence ring, and
   the two runner-up guesses with staggered entrance animations.

## Validation & confidence handling

- Backend rejects non-image content types, empty files, and anything over
  8 MB before it touches the model; the frontend mirrors the same checks so
  bad files are caught instantly instead of round-tripping to the server.
- **Leaf pre-check** — HSV hue/saturation/value heuristic rejects images that don't look like foliage (green/yellow/brown dominant). Returns 422 with message: "This doesn't look like a leaf photo — please upload a clear, close-up photo of a single plant leaf."
- Predictions under 50% confidence come back with `low_confidence: true`.
  The UI shows an amber warning banner and colors the confidence ring amber
  instead of green/red, prompting a retake rather than presenting a shaky
  guess as fact. Adjust the cutoff via `LOW_CONFIDENCE_THRESHOLD` in
  `main.py`.

## Extending it

- `treatments.py` is a plain dict — edit or expand any entry directly.
- To swap models, only `MODEL_NAME` in `main.py` needs to change, as long as
  the replacement exposes the same `AutoImageProcessor` /
  `AutoModelForImageClassification` interface and label format.
- For production, pin the model into a Docker image at build time so cold
  start doesn't re-download weights, and consider batching or a queue if
  traffic grows past a few concurrent requests (PyTorch inference on CPU is
  the likely bottleneck).