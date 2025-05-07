import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Table,
  Alert,
  Accordion,
} from "react-bootstrap";
import TraceMap from "../components/TraceMap";

export default function Result() {
  const location = useLocation();

  // ⬆️ useLocation() gets access to whatever was passed using navigate('/result', { state: { data } }) in Landing.js
  const data = location.state?.data;

  // ⬆️ data is the result of the traceroute from the backend
  const [focusedHop, setFocusedHop] = useState(null); // 🆕 NEW: state to zoom to hop on map

  if (!data || typeof data !== "object") {
    return <Alert variant="danger">No result data received.</Alert>;
  }

  // flatten structure for table — 🆕 moved into grouped format
  const grouped = Object.entries(data).reduce((acc, [target, result]) => {
    const host = result.host || "";
    const hops = result.hops || [];

    const rows = hops.flatMap((hop) => {
      const ttl = hop.ttl;
      const series = hop.series;

      // series is array of arrays, one per protocol
      return series.flatMap((probes) =>
        probes.map((probe) => ({
          target,
          host,
          ttl,
          proto: probe.proto,
          ip: probe.src,
          rtt: probe.rtt,
          lat: probe.lat,
          lon: probe.lon,
        }))
      );
    });

    acc[target] = { host, hops: rows };
    return acc;
  }, {});

  // 🆕 Flattened list of all hops across all destinations (for map)
  const allHops = Object.values(grouped).flatMap((entry) => entry.hops);

  return (
    <Container fluid className="py-4">
      <Row>
        {/* 🆕 Left Panel: Scrollable IP list and route tables */}
        <Col md={5} style={{ maxHeight: "90vh", overflowY: "auto" }}>
          <h4 className="mb-3">Traceroute Destinations</h4>

          <Accordion alwaysOpen>
            {Object.entries(grouped).map(([target, { host, hops }], index) => (
              <Accordion.Item eventKey={index.toString()} key={index}>
                <Accordion.Header>
                  {target} {host && `(${host})`}
                </Accordion.Header>
                <Accordion.Body>
                  <Table striped bordered hover responsive size="sm">
                    <thead>
                      <tr>
                        <th>TTL</th>
                        <th>Protocol</th>
                        <th>Router IP</th>
                        <th>RTT (ms)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hops.map((entry, i) => (
                        <tr
                          key={i}
                          onClick={() => setFocusedHop(entry)} // 🆕 allow hop focus
                          style={{ cursor: "pointer" }}
                        >
                          <td>{entry.ttl}</td>
                          <td>{entry.proto}</td>
                          <td>{entry.ip || "N/A"}</td>
                          <td>
                            {entry.rtt != null
                              ? entry.rtt.toFixed(2)
                              : "timeout"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Col>

        {/* 🆕 Right Panel: Interactive Map */}
        <Col md={7}>
          <h4 className="mb-3 text-center">Interactive Map</h4>
          <TraceMap hops={allHops} focus={focusedHop} />
        </Col>
      </Row>
    </Container>
  );
}
