# Crop Doctor

Pest/disease identification from a leaf photo: React frontend → FastAPI backend →
MobileNetV2 (fine-tuned on PlantVillage, 38 classes) → treatment lookup.

## Backend

Uses [uv](https://docs.astral.sh/uv/) for dependency management — no manual
venv step needed, `uv run` creates and reuses one automatically based on
`pyproject.toml`.

```bash
cd backend
uv run uvicorn main:app --reload --port 8000
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

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — Vite proxies `/api/*` to `http://localhost:8000/*`
(see `vite.config.js`), so no CORS setup is needed in dev beyond what's already
in `main.py`.

## How a request flows

1. User drops/selects a leaf photo in the browser.
2. Frontend POSTs it as `multipart/form-data` to `POST /diagnose`.
3. Backend opens the image with Pillow, runs it through the Hugging Face
   `AutoImageProcessor` (resize to 224×224, normalize) then the model.
4. Softmax over the 38 logits gives class probabilities; top-3 are kept.
5. The top class's raw label (e.g. `Tomato___Late_blight`) is split into
   crop + disease and looked up in `treatments.py` for organic/chemical
   suggestions.
6. JSON response → React renders the diagnosis card, confidence ring, and
   the two runner-up guesses.

## Validation & confidence handling

- Backend rejects non-image content types, empty files, and anything over
  8 MB before it touches the model; the frontend mirrors the same checks so
  bad files are caught instantly instead of round-tripping to the server.
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
