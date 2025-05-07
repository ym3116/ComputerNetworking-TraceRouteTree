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
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";


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

  // Flattened list of all hops across all destinations (for map)
  const allHops = Object.values(grouped).flatMap((entry) => entry.hops);


  // 🆕 Converts and downloads result as chosen format
  function handleDownload(data, format = "json") {
    const blobMap = {
      json: () =>
        new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        }),
      txt: () =>
        new Blob([JSON.stringify(data, null, 2)], {
          type: "text/plain",
        }),
      csv: () => {
        let csv = "Target,Host,TTL,Protocol,IP,RTT\n";
        Object.entries(data).forEach(([target, result]) => {
          const host = result.host || "";
          const hops = result.hops || [];
          hops.forEach((hop) => {
            const ttl = hop.ttl;
            const series = hop.series;
            series.forEach((probes) => {
              probes.forEach((probe) => {
                csv += `${target},${host},${ttl},${probe.proto},${probe.src},${probe.rtt}\n`;
              });
            });
          });
        });
        return new Blob([csv], { type: "text/csv" });
      },
      pdf: () => {
        const doc = new jsPDF();
        doc.setFontSize(10);
        let y = 10;
        Object.entries(data).forEach(([target, result]) => {
          doc.text(`Target: ${target} (${result.host || ""})`, 10, y);
          y += 6;
          result.hops.forEach((hop) => {
            const ttl = hop.ttl;
            hop.series.forEach((probes) => {
              probes.forEach((probe) => {
                doc.text(
                  `TTL ${ttl} - ${probe.proto} - ${probe.src || "N/A"} - RTT: ${
                    probe.rtt != null ? probe.rtt.toFixed(2) : "timeout"
                  }`,
                  10,
                  y
                );
                y += 6;
                if (y > 270) {
                  doc.addPage();
                  y = 10;
                }
              });
            });
          });
          y += 4;
        });
        return doc.output("blob");
      },
    };

    const blob = blobMap[format]();
    saveAs(blob, `traceroute_result.${format}`);
  }

  return (
    <Container fluid className="py-4">

      {/* 🆕 Download button dropdown */}
      <div className="mb-3 d-flex justify-content-end">
        <DropdownButton id="dropdown-basic-button" title="Download As" variant="secondary">
          <Dropdown.Item onClick={() => handleDownload(data, "json")}>JSON</Dropdown.Item>
          <Dropdown.Item onClick={() => handleDownload(data, "txt")}>TXT</Dropdown.Item>
          <Dropdown.Item onClick={() => handleDownload(data, "csv")}>CSV</Dropdown.Item>
          <Dropdown.Item onClick={() => handleDownload(data, "pdf")}>PDF</Dropdown.Item>
        </DropdownButton>
      </div>

      <Row>
        {/* Left Panel: Scrollable IP list and route tables */}
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

        {/* Right Panel: Interactive Map */}
        <Col md={7}>
          <h4 className="mb-3 text-center">Interactive Map</h4>
          <TraceMap hops={allHops} focus={focusedHop} />
        </Col>
      </Row>
    </Container>
  );
}
