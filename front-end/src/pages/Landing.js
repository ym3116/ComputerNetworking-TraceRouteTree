// src/pages/Landing.js
import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [minTtl, setMinTtl] = useState("");
  const [maxTtl, setMaxTtl] = useState("");
  const [probes, setProbes] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Pick a file first!");

    const fd = new FormData();
    fd.append("file", file);
    if (minTtl) fd.append("min_ttl", minTtl);
    if (maxTtl) fd.append("max_ttl", maxTtl);
    if (probes) fd.append("probes", probes);

    const rsp = await fetch("http://127.0.0.1:5000/api/trace", {
      method: "POST",
      body: fd,
    });

    if (!rsp.ok) {
      const errText = await rsp.text();
      console.error("Backend error:", errText);
      alert("Error: " + rsp.status);
      return;
    }

    const resultData = await rsp.json();
    console.log(resultData);
    // 1. Takes the result JSON from your backend (i.e. ttl, probes)
    // 2. Passes it to the result page using the navigate function
    navigate("/result", { state: { data: resultData } });
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="shadow" style={{ maxWidth: 600, width: "100%" }}>
        <Card.Body>
          <h2 className="mb-4 text-center">TraceViz</h2>

          <Form onSubmit={handleSubmit}>
            {/* file input */}
            <Form.Group className="mb-3">
              <Form.Label>IP list (.csv / .txt)</Form.Label>
              <Form.Control
                type="file"
                accept=".csv,.txt"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </Form.Group>

            {/* parameters */}
            <Row className="mb-4">
              <Col>
                <Form.Control
                  placeholder="min TTL (default 1)"
                  type="number"
                  value={minTtl}
                  onChange={(e) => setMinTtl(e.target.value)}
                />
              </Col>
              <Col>
                <Form.Control
                  placeholder="max TTL (default 20)"
                  type="number"
                  value={maxTtl}
                  onChange={(e) => setMaxTtl(e.target.value)}
                />
              </Col>
              <Col>
                <Form.Control
                  placeholder="probes (default 3)"
                  type="number"
                  value={probes}
                  onChange={(e) => setProbes(e.target.value)}
                />
              </Col>
            </Row>

            <div className="d-grid">
              <Button variant="primary" type="submit">
                Traceroute!
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
