import React, { useState } from "react";
import { Button } from "react-bootstrap";

import { useNavigate } from "react-router-dom";
import './Landing.css';


export default function Landing() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [minTtl, setMinTtl] = useState("");
  const [maxTtl, setMaxTtl] = useState("");
  const [probes, setProbes] = useState("");
  const [loading, setLoading] = useState(false); // NEW

  const [progress, setProgress] = useState(0); // NEW

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please upload a file.");
  
    setLoading(true);
    setProgress(0);
  
    // Start polling /api/progress
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/progress");
        const data = await res.json();
        setProgress(data.percentage || 0);
      } catch (err) {
        console.error("Progress polling error", err);
      }
    }, 500); // every 500ms
  
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (minTtl) fd.append("min_ttl", minTtl);
      if (maxTtl) fd.append("max_ttl", maxTtl);
      if (probes) fd.append("probes", probes);
  
      const rsp = await fetch("http://127.0.0.1:5000/api/trace", {
        method: "POST",
        body: fd,
      });
  
      const resultData = await rsp.json();
      clearInterval(pollInterval);
      setProgress(100); // ensure full bar
      setTimeout(() => navigate("/result", { state: { data: resultData } }), 500); // brief pause before navigating
    } catch (err) {
      alert("Something went wrong.");
      clearInterval(pollInterval);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="landing-wrapper">
      <div className="landing-hero">
        <h1 className="landing-title">TraceViz</h1>
        <p className="landing-subtitle">
          Visualize your network. Upload your targets. Fire the probes.
        </p>

        <form onSubmit={handleSubmit} className="landing-form">
          <label htmlFor="file" className="landing-label">Target File</label>
          <input
            type="file"
            id="file"
            accept=".csv,.txt"
            onChange={(e) => setFile(e.target.files[0])}
            className="landing-input"
          />

          <div className="landing-column-group">
            <div className="landing-column">
              <label className="landing-label">Min TTL</label>
              <input
                type="number"
                placeholder="Default: 1"
                value={minTtl}
                onChange={(e) => setMinTtl(e.target.value)}
                className="landing-input"
              />
            </div>
            <div className="landing-column">
              <label className="landing-label">Max TTL</label>
              <input
                type="number"
                placeholder="Default: 20"
                value={maxTtl}
                onChange={(e) => setMaxTtl(e.target.value)}
                className="landing-input"
              />
            </div>
            <div className="landing-column">
              <label className="landing-label">Probes</label>
              <input
                type="number"
                placeholder="Default: 3"
                value={probes}
                onChange={(e) => setProbes(e.target.value)}
                className="landing-input"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`landing-button ${loading ? "disabled-button" : ""}`}
            disabled={loading}
          >
            {loading ? " Launching..." : " Launch Trace"}
          </button>

          {loading && (
            <div className="loading-bar-container">
              <div className="loading-fill" style={{ width: `${progress}%` }} />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}