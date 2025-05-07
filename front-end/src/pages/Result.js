import { useNavigate } from "react-router-dom";

// src/pages/Result.js
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Container, Spinner, Alert } from "react-bootstrap";

export default function Result() {
  const [search] = useSearchParams();
  const url   = search.get("url");                // URL of the generated HTML
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  // Poll until the backend has finished writing the file
  useEffect(() => {
    if (!url) { setError("Missing result URL"); return; }
    let timer;
    const probe = async () => {
      try {
        const r = await fetch(url, { method: "HEAD" });
        if (r.ok) setReady(true);
        else timer = setTimeout(probe, 3000);     // keep polling
      } catch {
        timer = setTimeout(probe, 3000);
      }
    };
    probe();
    return () => clearTimeout(timer);
  }, [url]);

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container fluid className="p-0 vh-100">
      {!ready ? (
        <div className="d-flex vh-100 justify-content-center align-items-center">
          <Spinner animation="border" role="status" />
          <span className="ms-3">Running traceroute…</span>
        </div>
      ) : (
        <iframe
          title="Traceroute result"
          src={url}
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      )}
    </Container>
  );
}

  