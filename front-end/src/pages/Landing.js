// src/pages/Landing.js
import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [minTtl, setMinTtl] = useState("");
  const [maxTtl, setMaxTtl] = useState("");
  const [probes, setProbes] = useState("");
  const [showSample, setShowSample] = useState(false);
  const [isLoading, setIsLoading] = useState(false);



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Pick a file first!");
    if (minTtl && maxTtl && parseInt(maxTtl) <= parseInt(minTtl)) {
      return alert("Max TTL must be greater than Min TTL.");
    }

    const fd = new FormData();
    fd.append("file", file);
    if (minTtl) fd.append("min_ttl", minTtl);
    if (maxTtl) fd.append("max_ttl", maxTtl);
    if (probes) fd.append("probes", probes);


    try {
      setIsLoading(true);

      const rsp = await fetch("http://127.0.0.1:5000/api/trace", {
        method: "POST",
        body: fd,
      });
  
      if (!rsp.ok) {
        const errText = await rsp.text();
        throw new Error(`Backend error ${rsp.status}: ${errText}`);
      }
  
      const resultData = await rsp.json();
      navigate("/result", { state: { data: resultData } });

    } catch (err) {
      console.error("Fetch error:", err);
      alert(err.message || "Failed to fetch traceroute data.");

    } finally {
      setIsLoading(false); 
    }
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
              <Row className="g-2 align-items-center">
                <Col>
                  <Form.Control
                    type="file"
                    accept=".csv,.txt"
                    disabled={isLoading}
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </Col>
                <Col xs="auto">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowSample(true)}
                  >
                    Check Input Sample
                  </Button>
                </Col>
              </Row>
            </Form.Group>

            {/* parameters */}
            <Form.Group className="mb-4">
              <Form.Label>TTL / Probes Parameters (Please enter non zero integers)</Form.Label>
              <Row className="mb-2 align-items-center">
                <Col xs={4}><Form.Label className="mb-0">Min TTL</Form.Label></Col>
                <Col>
                  <Form.Control
                    type="number"
                    value={minTtl}
                    onChange={(e) => setMinTtl(e.target.value)}
                    placeholder="Default 1"
                  />
                </Col>
              </Row>

              <Row className="mb-2 align-items-center">
                <Col xs={4}><Form.Label className="mb-0">Max TTL</Form.Label></Col>
                <Col>
                  <Form.Control
                    type="number"
                    value={maxTtl}
                    onChange={(e) => setMaxTtl(e.target.value)}
                    placeholder="Default 20"
                  />
                </Col>
              </Row>

              <Row className="align-items-center">
                <Col xs={4}><Form.Label className="mb-0">Probe Numbers</Form.Label></Col>
                <Col>
                  <Form.Control
                    type="number"
                    value={probes}
                    onChange={(e) => setProbes(e.target.value)}
                    placeholder="Default 3"
                  />
                </Col>
              </Row>
            </Form.Group>

            <div className="d-grid">
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? "Tracing... please wait" : "Traceroute!"}
            </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Modal show={showSample} onHide={() => setShowSample(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Input Sample Format</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please upload a <code>.csv</code> or <code>.txt</code> file with the following format:</p>
          <p>The first row should always be IP and hostname and there should be at least one row of IP to trace. Using a comma to seperate IP and hostname. 
            In the data part the hostname could be left blank, but the IP couldn't be null.</p>
          <pre style={{ backgroundColor: "#f8f9fa", padding: "1em", borderRadius: "6px", overflowX: "auto", whiteSpace: "pre-wrap" }}>
{`IP,Hostname
8.8.8.8,dns.google
1.1.1.1,one.one.one.one
93.184.216.34,example.com
151.101.1.69,www.fastly.com
142.250.190.14,google.com
18.216.12.123,ec2-18-216-12-123.us-east-2.compute.amazonaws.com
52.216.30.206,dynamodb.us-east-1.amazonaws.com
23.235.33.205,www.cloudflare.com
104.244.42.65,twitter.com
208.80.154.224,wikipedia.org
140.82.113.3,github.com
13.225.244.104,edgekey.net
17.253.144.10,apple.com
52.94.225.248,ec2-52-94-225-248.compute-1.amazonaws.com
151.101.129.140,www.redditstatic.com`}</pre>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSample(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}
