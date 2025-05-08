import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import TraceMap from "../components/TraceMap";
import "./Result.css";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";

export default function Result() {
  const location = useLocation();
  const data = location.state?.data;
  const [focusedHop, setFocusedHop] = useState(null);
  const [playingTarget, setPlayingTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 🆕 state to track which destinations are expanded
  const [expanded, setExpanded] = useState({});

  if (!data || typeof data !== "object") {
    return (
      <div className="result-wrapper">
        <p className="error-message">No result data received.</p>
      </div>
    );
  }

  const grouped = Object.entries(data).reduce((acc, [target, result]) => {
    const host = result.host || "";
    const hops = result.hops || [];

    const rows = hops.flatMap((hop) => {
      const ttl = hop.ttl;
      const series = hop.series;

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

  // Converts and downloads result as chosen format
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
    <div className="result-wrapper">
      <div className="result-panel">
        <h1 className="result-title">Trace Results</h1>

        {/* Download button dropdown */}
        <div className="mb-3 d-flex justify-content-end">
          <DropdownButton
            id="dropdown-basic-button"
            title="Download As"
            variant="secondary"
          >
            <Dropdown.Item onClick={() => handleDownload(data, "json")}>
              JSON
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleDownload(data, "txt")}>
              TXT
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleDownload(data, "csv")}>
              CSV
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleDownload(data, "pdf")}>
              PDF
            </Dropdown.Item>
          </DropdownButton>
        </div>

        <div className="result-content">
          <div className="result-left">
            {/* Search bar */}
            <input
              type="text"
              placeholder="Search by IP or Hostname..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "20px",
                fontSize: "1rem",
                borderRadius: "8px",
                border: "1px solid #333",
                backgroundColor: "#111",
                color: "#fff",
                fontFamily: "'Times New Roman', serif",
              }}
            />

            {/* Destination Tables with toggle */}
            {Object.entries(grouped)
              .filter(([target, { host }]) =>
                target.includes(searchTerm) || host.includes(searchTerm)
              )
              .map(([target, { host, hops }], idx) => {
                const isOpen = expanded[target] || false;

                return (
                  <div key={idx} className="result-card">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [target]: !isOpen,
                        }))
                      }
                    >
                      <h2 className="result-subtitle" style={{ margin: 0 }}>
                        {target} {host && <span>({host})</span>}
                      </h2>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFocusedHop(null);
                          setPlayingTarget(target);
                        }}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          backgroundColor: "#00f2ff",
                          border: "none",
                          fontFamily: "'Orbitron', sans-serif",
                          fontWeight: "bold",
                          color: "#000",
                          cursor: "pointer",
                          boxShadow: "0 0 6px #00f2ff",
                        }}
                      >
                        Play
                      </button>
                    </div>

                    {/* Toggleable Hop Table */}
                    {isOpen && (
                      <table className="result-table" style={{ marginTop: "10px" }}>
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
                              onClick={() => setFocusedHop(entry)}
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
                      </table>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Map Panel */}
          <div className="result-map">
            <h2 className="result-subtitle text-center">Interactive Map</h2>
            <TraceMap
              hops={allHops}
              focus={focusedHop}
              playingTarget={playingTarget}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
