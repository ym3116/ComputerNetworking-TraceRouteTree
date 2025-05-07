// src/pages/Result.js
import React from "react";
import { useLocation } from "react-router-dom";
import { Table, Container, Alert } from "react-bootstrap";

export default function Result() {
  const location = useLocation();
  // ⬆️ useLocation() gets access to whatever was passed using navigate('/result', { state: { data } }) in Landing.js
  const data = location.state?.data;
  // ⬆️ data is the result of the traceroute from the backend
  
  if (!data || !Array.isArray(data)) {
    return <Alert variant="danger">No result data received.</Alert>;
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Traceroute Results</h2>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Hop</th>
            <th>Target</th>
            <th>Protocol</th>
            <th>IP</th>
            <th>Hostname</th>
            <th>Location</th>
            <th>RTT (ms)</th>
            <th>Packet Loss</th>
          </tr>
        </thead>
        <tbody>
          {data.map((hop, i) =>
            hop.series.map((pkt, j) => (
              <tr key={`${i}-${j}`}>
                <td>{i + 1}</td>
                <td>{hop.target}</td>
                <td>{pkt.proto}</td>
                <td>{pkt.ip || "N/A"}</td>
                <td>{pkt.hostname || "N/A"}</td>
                <td>{pkt.location || "N/A"}</td>
                <td>{pkt.rtt != null ? pkt.rtt.toFixed(2) : "timeout"}</td>
                <td>{pkt.loss != null ? pkt.loss + "%" : "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
}
