import { useCallback, useRef, useState } from "react";

const API_URL = "/api/diagnose";
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB, matches backend cap
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState("idle"); 
  const [result, setResult] = useState(null);
  const [advisory, setAdvisory] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setStatus("idle");
    setResult(null);
    setAdvisory(null);
    setError(null);
  };

  const handleFile = useCallback((f) => {
    if (!f) return;
    setResult(null);

    if (!ALLOWED_TYPES.includes(f.type)) {
      setError("Please choose a JPEG, PNG, or WEBP image.");
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setError(`That image is too large — keep it under ${MAX_FILE_BYTES / (1024 * 1024)} MB.`);
      return;
    }

    setError(null);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const runDiagnosis = async () => {
    if (!file) return;
    setStatus("scanning");
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(API_URL, { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setResult(data);

      // Fetch Advisory
      try {
        const coords = await getCoords();
        if (coords) {
          const advRes = await fetch(
            `/api/advisory?crop=${encodeURIComponent(data.crop)}&is_healthy=${data.is_healthy}&latitude=${coords.lat}&longitude=${coords.lng}`
          );
          if (advRes.ok) {
            const advData = await advRes.json();
            setAdvisory(advData);
          }
        }
      } catch (advErr) {
        console.error("Advisory fetch failed:", advErr);
      }

      setStatus("done");
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setStatus("error");
    }
  };

  const getCoords = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn("Geolocation not supported");
        resolve(null);
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => {
            console.warn("Location access denied");
            resolve(null);
          }
        );
      }
    });
  };

  return (
    <div className={`page ${theme}`}>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path
                d="M12 2C7 4 4 8 4 13c0 4.4 3.6 8 8 8s8-3.6 8-8c0-5-3-9-8-11z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path d="M12 6v14M12 10c-2 0-3.5-1.2-4.5-3M12 14c2.4 0 4-1.4 5-3.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </span>
          <span className="brand-name">AgroScan</span>
        </div>
        <div className="topbar-right">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle light/dark mode">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <span className="topbar-note">field diagnosis · 38 conditions</span>
        </div>
      </header>

      <main className="layout">
        <section className="intake">
          <p className="eyebrow">01 — Submit a leaf</p>
          <h1>
            Photograph the leaf.
            <br />
            We'll read the symptoms.
          </h1>
          <p className="lede">
            Upload a clear, well-lit photo of a single leaf. The model checks it against 38
            known crop conditions across tomato, potato, corn, apple, grape and more, then
            hands back a diagnosis with treatment options.
          </p>
          <div className="disclaimer">
            <strong>Supported Crops:</strong> Apple, Blueberry, Cherry, Corn, Grape, Orange, Peach, Pepper, Potato, Raspberry, Soybean, Squash, Strawberry, Tomato.
            <br />
            <em>Note: This tool is for educational purposes and should be used as a supplement to professional agricultural advice.</em>
          </div>

          <div
            className={`dropzone ${dragActive ? "active" : ""} ${previewUrl ? "has-image" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Selected leaf" className="preview-img" />
            ) : (
              <div className="dropzone-copy">
                <span className="dropzone-icon" aria-hidden="true">
                  ⌁
                </span>
                <p>Drop a photo here, or click to choose one</p>
                <p className="dropzone-hint">JPG, PNG or WEBP · under 8MB · one leaf, filling most of the frame</p>
              </div>
            )}
            {status === "scanning" && (
              <div className="scan-overlay">
                <div className="scan-line" />
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          <div className="actions">
            <button
              className="btn-primary"
              disabled={!file || status === "scanning"}
              onClick={runDiagnosis}
            >
              {status === "scanning" ? "Reading leaf…" : "Diagnose leaf"}
            </button>
            {(file || result) && (
              <button className="btn-ghost" onClick={reset} disabled={status === "scanning"}>
                Start over
              </button>
            )}
          </div>

          {error && <p className="error-msg">⚠ {error}</p>}
        </section>

        <section className="readout">
          <p className="eyebrow">02 — Diagnosis</p>
          {!result && status !== "scanning" && (
            <div className="placeholder">
              <p>Results will appear here once a leaf has been scanned.</p>
            </div>
          )}
          {status === "scanning" && (
            <div className="placeholder scanning-placeholder">
              <p>Resizing to 224×224, running convolutional layers…</p>
            </div>
          )}
          {result && (
            <>
              <DiagnosisCard result={result} />
              <div className="advisory-container" style={{ marginTop: '2rem' }}>
                <p className="eyebrow">03 — Weather Advisory</p>
                {!advisory && status === "done" && (
                  <div className="placeholder">
                    <p>Weather-aware advice could not be loaded.</p>
                  </div>
                )}
                {status === "scanning" && (
                  <div className="placeholder scanning-placeholder">
                    <p>Fetching local weather forecast…</p>
                  </div>
                )}
                {advisory && <AdvisoryCard advisory={advisory} />}
              </div>
            </>
          )}
        </section>
      </main>

      <footer className="foot">
        <span>MobileNetV2 · fine-tuned on PlantVillage · ~78.6% eval accuracy</span>
      </footer>
    </div>
  );
}

function DiagnosisCard({ result }) {
  const { crop, disease, is_healthy, confidence, low_confidence, treatment, alternatives } =
    result;

  return (
    <div className={`card ${is_healthy ? "healthy" : "sick"}`}>
      {low_confidence && (
        <div className="low-confidence-banner">
          <span aria-hidden="true">⚠</span>
          <span>
            Low confidence ({confidence}%) — the model isn't sure. Try a closer, better-lit
            photo of a single leaf before trusting this diagnosis.
          </span>
        </div>
      )}

      <div className="card-head">
        <div>
          <p className="card-crop">{crop}</p>
          <h2 className="card-disease">{disease}</h2>
        </div>
        <ConfidenceRing value={confidence} healthy={is_healthy} lowConfidence={low_confidence} />
      </div>

      {!is_healthy && (
        <div className="treatment-grid">
          <div className="treatment organic">
            <p className="treatment-label">Organic</p>
            <p>{treatment.organic}</p>
          </div>
          <div className="treatment chemical">
            <p className="treatment-label">Chemical</p>
            <p>{treatment.chemical}</p>
          </div>
        </div>
      )}

      {is_healthy && (
        <p className="healthy-note">
          No signs of disease detected. {treatment.organic}
        </p>
      )}

      {alternatives?.length > 0 && (
        <div className="alt-list">
          <p className="alt-label">Other possibilities considered</p>
          <ul>
            {alternatives.map((alt) => (
              <li key={alt.raw_label}>
                <span>
                  {alt.crop} — {alt.disease}
                </span>
                <span className="alt-conf">{alt.confidence}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ConfidenceRing({ value, healthy, lowConfidence }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const ringClass = lowConfidence ? "uncertain" : healthy ? "ok" : "warn";
  return (
    <div className="ring">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} className="ring-track" />
        <circle
          cx="36"
          cy="36"
          r={r}
          className={`ring-value ${ringClass}`}
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 36 36)"
        />
      </svg>
      <span className="ring-number">{value}%</span>
    </div>
  );
}

function AdvisoryCard({ advisory }) {
  const { crop, forecast_summary, recommendations } = advisory;

  return (
    <div className="card advisory">
      <div className="card-head">
        <div>
          <p className="card-crop">{crop}</p>
          <h2 className="card-disease">Weather Advisory</h2>
        </div>
        <div className="weather-summary">
          <span>🌧 {forecast_summary.rain_next_3_days_mm}mm rain</span>
          <span>💧 {forecast_summary.avg_humidity_pct}% humidity</span>
        </div>
      </div>

      <div className="advisory-grid">
        {recommendations.map((rec, i) => (
          <div key={i} className="advisory-item">
            <p className="advisory-category">{rec.category}</p>
            <p>{rec.advice}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
