import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X } from "@phosphor-icons/react";
import {
  Dropzone,
  PrimaryButton,
  ResetButton,
  ThemeToggle,
  DiagnosisCard,
  AdvisoryCard,
  DiagnosisSkeleton,
  AdvisorySkeleton,
  ScanningSkeleton,
  AdvisoryLoadingSkeleton,
} from "./src/components";

const API_URL = "/api/diagnose";
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [advisory, setAdvisory] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("agroscan-theme");
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("agroscan-theme", theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

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
    setAdvisory(null);
    setError(null);

    if (!ALLOWED_TYPES.includes(f.type)) {
      setError("Please choose a JPEG, PNG, or WEBP image.");
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setError(`That image is too large — keep it under ${MAX_FILE_BYTES / (1024 * 1024)} MB.`);
      return;
    }

    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }, []);

  const getCoords = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn("Geolocation not supported");
        resolve(null);
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => {
            console.warn("Location access denied:", err.message);
            resolve(null);
          },
          { timeout: 5000 }
        );
      }
    });
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
      setError(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className={`page ${theme}`}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="topbar" role="banner">
        <div className="topbar-inner">
          <div className="topbar-left">
            <a href="/" className="brand" aria-label="AgroScan home">
              <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 100 100" width="28" height="28" fill="none">
                  <path
                    d="M50 8C30 15 12 35 12 58c0 20 14 36 38 36s38-16 38-36c0-23-18-43-38-50z"
                    stroke="currentColor"
                    strokeWidth="6"
                  />
                  <path
                    d="M50 18v64M50 30c-12 0-21 7-28 18M50 42c16 0 26-9 33-22"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="brand-name">AgroScan</span>
            </a>
          </div>
          <div className="topbar-right">
            <span className="topbar-note" aria-hidden="true">Field diagnosis · 38 conditions</span>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      <main className="layout" id="main-content" role="main">
        <section className="intake" aria-labelledby="intake-heading">
          <p className="eyebrow" id="intake-heading">01 — Submit a leaf</p>
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
          <div className="disclaimer" role="note">
            <strong>Supported crops:</strong> Apple, Blueberry, Cherry, Corn, Grape, Orange, Peach,
            Pepper, Potato, Raspberry, Soybean, Squash, Strawberry, Tomato.
            <br />
            <em>This tool is for educational purposes and supplements — not replaces — professional agricultural advice.</em>
          </div>

          <Dropzone
            file={file}
            previewUrl={previewUrl}
            status={status}
            onFileSelect={handleFile}
            onReset={reset}
          />

          {error && (
            <motion.div
              className="error-msg"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              role="alert"
            >
              <X size={20} weight="duotone" style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="actions">
            <PrimaryButton
              disabled={!file || status === "scanning"}
              onClick={runDiagnosis}
              loading={status === "scanning"}
            >
              Diagnose leaf
            </PrimaryButton>
            {(file || result) && (
              <ResetButton onClick={reset} disabled={status === "scanning"} />
            )}
          </div>
        </section>

        <section className="readout" aria-labelledby="readout-heading">
          <p className="eyebrow" id="readout-heading">02 — Diagnosis</p>
          {!result && status !== "scanning" && (
            <div className="placeholder" role="status" aria-live="polite">
              <span className="placeholder-icon" aria-hidden="true">ℹ</span>
              <p>Results will appear here once a leaf has been scanned.</p>
            </div>
          )}
          {status === "scanning" && <ScanningSkeleton />}
          {result && (
            <>
              <DiagnosisCard result={result} />
              <div className="advisory-container" style={{ marginTop: "2.5rem" }}>
                <p className="eyebrow">03 — Weather Advisory</p>
                {!advisory && status === "done" && (
                  <div className="placeholder" role="status">
                    <span className="placeholder-icon" aria-hidden="true">☁</span>
                    <p>Weather-aware advice could not be loaded for your location.</p>
                    <p style={{ fontSize: "0.875rem", color: "var(--fg-subtle)", marginTop: "8px" }}>
                      Enable location access or check manually for local conditions.
                    </p>
                  </div>
                )}
                {status === "scanning" && <AdvisoryLoadingSkeleton />}
                {advisory && <AdvisoryCard advisory={advisory} />}
              </div>
            </>
          )}
        </section>
      </main>

      <footer className="foot" role="contentinfo">
        <p>MobileNetV2 · fine-tuned on PlantVillage · ~78.6% eval accuracy</p>
        <p style={{ marginTop: "8px", fontSize: "0.6rem" }}>
          For educational use only. Not a substitute for professional agricultural advice.
        </p>
      </footer>
    </div>
  );
}