import React from "react";
import { useLocation } from "react-router-dom";
import { Container, Table, Alert } from "react-bootstrap";

export default function Result() {
  const location = useLocation();
  // ⬆️ useLocation() gets access to whatever was passed using navigate('/result', { state: { data } }) in Landing.js
  const data = location.state?.data;
  // ⬆️ data is the result of the traceroute from the backend

  if (!data || typeof data !== "object") {
    return <Alert variant="danger">No result data received.</Alert>;
  }

  // flatten structure for table
  const flattened = Object.entries(data).flatMap(([target, result]) => {
    const host = result.host || "";
    const hops = result.hops || [];

    return hops.flatMap((hop) => {
      const ttl = hop.ttl;
      const series = hop.series;

      // series is array of arrays, one per protocol
      return series.flatMap((probes, index) =>
        probes.map((probe) => ({
          target,
          host,
          ttl,
          proto: probe.proto,
          ip: probe.src,
          rtt: probe.rtt,
        }))
      );
    });
  });

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Traceroute Results</h2>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Target</th>
            <th>Host</th>
            <th>TTL</th>
            <th>Protocol</th>
            <th>Router IP</th>
            <th>RTT (ms)</th>
          </tr>
        </thead>
        <tbody>
          {flattened.map((entry, i) => (
            <tr key={i}>
              <td>{entry.target}</td>
              <td>{entry.host}</td>
              <td>{entry.ttl}</td>
              <td>{entry.proto}</td>
              <td>{entry.ip || "N/A"}</td>
              <td>{entry.rtt != null ? entry.rtt.toFixed(2) : "timeout"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
