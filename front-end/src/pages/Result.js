import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Container, Table, Alert } from "react-bootstrap";
import TraceMap from "../components/TraceMap";

export default function Result() {
  const location = useLocation();
  // ⬆️ useLocation() gets access to whatever was passed using navigate('/result', { state: { data } }) in Landing.js
  const data = location.state?.data;
  const [focusedHop, setFocusedHop] = useState(null); 
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
          lat: probe.lat, // ✅ include lat/lon for the map
          lon: probe.lon,
        }))
      );
    });
  });

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Traceroute Results</h2>

      {/* ✅ Map Section */}
      <h4 className="mb-3">Interactive Map</h4>
      <TraceMap hops={flattened} focus={focusedHop} />

      {/* ✅ Table Section */}
      <h4 className="mt-5 mb-3">Detailed Table (you may click on the public ips to zoom in on the location)</h4>
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
            <tr key={i} onClick={() => setFocusedHop(entry)} style={{ cursor: "pointer" }}>
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
