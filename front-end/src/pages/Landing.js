// // src/pages/Landing.js
// import React, { useState } from "react";
// import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";

// export default function Landing() {
//   const navigate = useNavigate();

//   const [file, setFile] = useState(null);
//   const [minTtl, setMinTtl] = useState("");
//   const [maxTtl, setMaxTtl] = useState("");
//   const [probes, setProbes] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!file) return alert("Pick a file first!");

//     const fd = new FormData();
//     fd.append("file", file);
//     if (minTtl) fd.append("min_ttl", minTtl);
//     if (maxTtl) fd.append("max_ttl", maxTtl);
//     if (probes) fd.append("probes", probes);

//     const rsp = await fetch("http://127.0.0.1:5000/api/trace", {
//       method: "POST",
//       body: fd,
//     });
//     const resultData = await rsp.json();
//     // 1. Takes the result JSON from your backend (i.e. ttl, probes)
//     // 2. Passes it to the result page using the navigate function
//     navigate("/result", { state: { data: resultData } });
//   };


















  
//   return (
//     <Container className="d-flex justify-content-center align-items-center vh-100">
//       <Card className="shadow" style={{ maxWidth: 600, width: "100%" }}>
//         <Card.Body>
//           <h2 className="mb-4 text-center">TraceViz</h2>

//           <Form onSubmit={handleSubmit}>
//             {/* file input */}
//             <Form.Group className="mb-3">
//               <Form.Label>IP list (.csv / .txt)</Form.Label>
//               <Form.Control
//                 type="file"
//                 accept=".csv,.txt"
//                 onChange={(e) => setFile(e.target.files[0])}
//               />
//             </Form.Group>

//             {/* parameters */}
//             <Row className="mb-4">
//               <Col>
//                 <Form.Control
//                   placeholder="min TTL (default 1)"
//                   type="number"
//                   value={minTtl}
//                   onChange={(e) => setMinTtl(e.target.value)}
//                 />
//               </Col>
//               <Col>
//                 <Form.Control
//                   placeholder="max TTL (default 20)"
//                   type="number"
//                   value={maxTtl}
//                   onChange={(e) => setMaxTtl(e.target.value)}
//                 />
//               </Col>
//               <Col>
//                 <Form.Control
//                   placeholder="probes (default 3)"
//                   type="number"
//                   value={probes}
//                   onChange={(e) => setProbes(e.target.value)}
//                 />
//               </Col>
//             </Row>

//             <div className="d-grid">
//               <Button variant="primary" type="submit">
//                 Traceroute!
//               </Button>
//             </div>
//           </Form>
//         </Card.Body>
//       </Card>
//     </Container>
//   );






// }




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
    <div style={styles.wrapper}>
      <div style={styles.hero}>
        <h1 style={styles.title}>TraceViz</h1>
        <p style={styles.subtitle}>
          Visualize your network. Upload your targets. Fire the probes.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label htmlFor="file" style={styles.label}>
            Target File
          </label>
          <input
            type="file"
            id="file"
            accept=".csv,.txt"
            onChange={(e) => setFile(e.target.files[0])}
            style={styles.input}
          />

          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>Min TTL</label>
              <input
                type="number"
                placeholder="Default: 1"
                value={minTtl}
                onChange={(e) => setMinTtl(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Max TTL</label>
              <input
                type="number"
                placeholder="Default: 20"
                value={maxTtl}
                onChange={(e) => setMaxTtl(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Probes</label>
              <input
                type="number"
                placeholder="Default: 3"
                value={probes}
                onChange={(e) => setProbes(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>



          <Button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              pointerEvents: loading ? "none" : "auto",
            }}
            className="cool-button"
          >
            {loading ? " Launching..." : " Launch Trace"}
          </Button>

          {loading && (
  <div className="loading-bar-container">
    <div className="loading-fill" style={{ width: `${progress}%` }} />
  </div>
)}





{/* 


          <Button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              pointerEvents: loading ? "none" : "auto",
            }}
            className="cool-button"
          >
            {loading ? " Launching..." : " Launch Trace"}
          </Button> */}
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    backgroundColor: "#0a0a0a",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    fontFamily: "'Times New Roman', serif",
  },
  hero: {
    width: "100%",
    maxWidth: "700px",
    padding: "40px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    boxShadow: "0 0 20px rgba(0, 255, 255, 0.05)",
    backdropFilter: "blur(12px)",
  },
  title: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "3.2rem",
    fontWeight: "700",
    marginBottom: "10px",
    color: "#0ff",
    textAlign: "center",
    animation: "glow 2s ease-in-out infinite alternate",
    letterSpacing: "1px",
  },
  subtitle: {
    fontSize: "1.2rem",
    textAlign: "center",
    color: "#ffffff",
    marginBottom: "30px",
    letterSpacing: "0.5px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  label: {
    fontSize: "1rem",
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#ffffff",
  },
  input: {
    width: "100%",
    padding: "10px 15px",
    borderRadius: "8px",
    border: "1px solid #333",
    backgroundColor: "#111",
    color: "#fff",
    outline: "none",
    fontFamily: "'Times New Roman', serif",
  },
  row: {
    display: "flex",
    gap: "15px",
  },
  col: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  button: {
    marginTop: "10px",
    padding: "20px",
    borderRadius: "12px",
    backgroundColor: "#00f2ff",
    color: "#000",
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: "700",
    fontSize: "1.5rem",
    border: "2px solid #00f2ff",
    boxShadow: "0 0 16px #00f2ff, 0 0 32px #00f2ff",
    cursor: "pointer",
    transition: "transform 0.25s ease, box-shadow 0.25s ease, border 0.25s ease",
  },
};










