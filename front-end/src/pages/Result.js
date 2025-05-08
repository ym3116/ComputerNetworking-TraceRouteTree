import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import TraceMap from "../components/TraceMap";
import "./Result.css";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import { Dropdown, DropdownButton } from "react-bootstrap";


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
        <p className="error-message">No result data received. Please go to landing page and execute traceroute first.</p>
      </div>
    );
  }


    // Change3: cannot really undertsand what is going on...
    const grouped = Object.entries(data).reduce((acc, [target, result]) => {
      const host = result.host || "";
      const hops = result.hops || [];
    
      let timeoutCount = 0;
      let totalCount = 0;
    
      const rows = hops.flatMap((hop) => {
        const ttl = hop.ttl;
        const series = hop.series;
    
        return series.flatMap((probes) => {
          return probes.map((probe) => {
            totalCount += 1;
            if (probe.rtt == null) timeoutCount += 1;
          
            return {
              target,
              host,
              ttl,
              proto: probe.proto,
              ip: probe.src,
              rtt: probe.rtt != null ? probe.rtt * 1000 : null,  // ⬅️ multiply here
              lat: probe.lat,
              lon: probe.lon,
            };
          });
          
        });
      });
    
      const lossRate = totalCount > 0 ? (timeoutCount / totalCount) * 100 : 0;
    
      acc[target] = { host, hops: rows, lossRate };
      return acc;
    }, {});
   

  // Flattened list of all hops across all destinations (for map)
  const allHops = Object.values(grouped).flatMap((entry) => entry.hops);

  // Converts and downloads result as chosen format
  function handleDownload(_, format = "json") {
    const blobMap = {
      json: () =>
        new Blob([JSON.stringify(grouped, null, 2)], {
          type: "application/json",
        }),
      txt: () =>
        new Blob([JSON.stringify(grouped, null, 2)], {
          type: "text/plain",
        }),
      csv: () => {
        let csv = "Target,Host,TTL,Protocol,IP,RTT (ms)\n";
        Object.entries(grouped).forEach(([target, result]) => {
          const host = result.host || "";
          const hops = result.hops || [];
          hops.forEach((hop) => {
            csv += `${target},${host},${hop.ttl},${hop.proto},${hop.ip || "N/A"},${hop.rtt != null ? hop.rtt.toFixed(2) : "timeout"}\n`;
          });
        });
        return new Blob([csv], { type: "text/csv" });
      },
      pdf: () => {
        const doc = new jsPDF();
        doc.setFontSize(10);
        let y = 10;
        Object.entries(grouped).forEach(([target, result]) => {
          doc.text(`Target: ${target} (${result.host || ""})`, 10, y);
          y += 6;
          result.hops.forEach((hop) => {
            doc.text(
              `TTL ${hop.ttl} - ${hop.proto} - ${hop.ip || "N/A"} - RTT: ${
                hop.rtt != null ? `${hop.rtt.toFixed(2)} ms` : "timeout"
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
            title="Download Origin Traceroute Result As"
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

        {/* Change2: replace the original row to make the whole row clickable */}
        <div className="result-content">
          <div className="result-left">
            <input
              type="text"
              placeholder="Search by IP or Hostname..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="result-search"
            />

            {/* Destination Tables with toggle */}
            {Object.entries(grouped)
              .filter(([target, { host }]) =>
                target.includes(searchTerm) || host.includes(searchTerm)
              )
              // .map(([target, { host, hops }], idx) => {
                // change 4: Extract lossRate during rendering
                .map(([target, { host, hops, lossRate }], idx) => {

                const isOpen = expanded[target] || false;

                return (
                  <div key={idx} className="result-card">
            <div
              className="result-card-header clickable-row"
              onClick={() => {
                setExpanded((prev) => ({
                  ...prev,
                  [target]: !isOpen,
                }));
                setFocusedHop(null);
                setPlayingTarget(target); // 👈 directly set the target here
              }}
              title="Click this row to see details and enable trace playback"
            >

{/* Change 5: Display the packet loss rate */}
<h2 className="result-subtitle" style={{ margin: 0, color: lossRate > 70 ? "#ff4d4d" : undefined }}>
  {target} {host && <span>({host})</span>} — Loss: {lossRate.toFixed(1)}%
</h2>



                      {/* Change1: delete the play button on the right */}
                      {/* <button className="play-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFocusedHop(null);
                          setPlayingTarget(target);
                        }}
                      >
                        Play
                      </button> */}
                    </div>

                    {/* Toggleable Hop Table */}
                    {isOpen && (
                      <table className="result-table">
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
                              className="result-row"
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
