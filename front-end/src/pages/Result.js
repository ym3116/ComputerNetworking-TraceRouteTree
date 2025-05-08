// import React, { useState } from "react";
// import { useLocation } from "react-router-dom";
// import {
//   Container,
//   Row,
//   Col,
//   Table,
//   Alert,
//   Accordion,
// } from "react-bootstrap";
// import TraceMap from "../components/TraceMap";

// export default function Result() {
//   const location = useLocation();

//   // ⬆️ useLocation() gets access to whatever was passed using navigate('/result', { state: { data } }) in Landing.js
//   const data = location.state?.data;

//   // ⬆️ data is the result of the traceroute from the backend
//   const [focusedHop, setFocusedHop] = useState(null); // 🆕 NEW: state to zoom to hop on map

//   if (!data || typeof data !== "object") {
//     return <Alert variant="danger">No result data received.</Alert>;
//   }

//   // flatten structure for table — 🆕 moved into grouped format
//   const grouped = Object.entries(data).reduce((acc, [target, result]) => {
//     const host = result.host || "";
//     const hops = result.hops || [];

//     const rows = hops.flatMap((hop) => {
//       const ttl = hop.ttl;
//       const series = hop.series;

//       // series is array of arrays, one per protocol
//       return series.flatMap((probes) =>
//         probes.map((probe) => ({
//           target,
//           host,
//           ttl,
//           proto: probe.proto,
//           ip: probe.src,
//           rtt: probe.rtt,
//           lat: probe.lat,
//           lon: probe.lon,
//         }))
//       );
//     });

//     acc[target] = { host, hops: rows };
//     return acc;
//   }, {});

//   // 🆕 Flattened list of all hops across all destinations (for map)
//   const allHops = Object.values(grouped).flatMap((entry) => entry.hops);

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         {/* 🆕 Left Panel: Scrollable IP list and route tables */}
//         <Col md={5} style={{ maxHeight: "90vh", overflowY: "auto" }}>
//           <h4 className="mb-3">Traceroute Destinations</h4>

//           <Accordion alwaysOpen>
//             {Object.entries(grouped).map(([target, { host, hops }], index) => (
//               <Accordion.Item eventKey={index.toString()} key={index}>
//                 <Accordion.Header>
//                   {target} {host && `(${host})`}
//                 </Accordion.Header>
//                 <Accordion.Body>
//                   <Table striped bordered hover responsive size="sm">
//                     <thead>
//                       <tr>
//                         <th>TTL</th>
//                         <th>Protocol</th>
//                         <th>Router IP</th>
//                         <th>RTT (ms)</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {hops.map((entry, i) => (
//                         <tr
//                           key={i}
//                           onClick={() => setFocusedHop(entry)} // 🆕 allow hop focus
//                           style={{ cursor: "pointer" }}
//                         >
//                           <td>{entry.ttl}</td>
//                           <td>{entry.proto}</td>
//                           <td>{entry.ip || "N/A"}</td>
//                           <td>
//                             {entry.rtt != null
//                               ? entry.rtt.toFixed(2)
//                               : "timeout"}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </Table>
//                 </Accordion.Body>
//               </Accordion.Item>
//             ))}
//           </Accordion>
//         </Col>

//         {/* 🆕 Right Panel: Interactive Map */}
//         <Col md={7}>
//           <h4 className="mb-3 text-center">Interactive Map</h4>
//           <TraceMap hops={allHops} focus={focusedHop} />
//         </Col>
//       </Row>
//     </Container>
//   );
// }



// // import ReactTooltip from "react-tooltip";
// import React, { useState } from "react";
// import { useLocation } from "react-router-dom";
// import TraceMap from "../components/TraceMap";
// import "./Result.css"; // Add a CSS file just like Landing.css

// export default function Result() {
//   const location = useLocation();
//   const data = location.state?.data;
//   const [focusedHop, setFocusedHop] = useState(null);

//   if (!data || typeof data !== "object") {
//     return (
//       <div className="result-wrapper">
//         <p className="error-message">No result data received.</p>
//       </div>
//     );
//   }

//   const grouped = Object.entries(data).reduce((acc, [target, result]) => {
//     const host = result.host || "";
//     const hops = result.hops || [];

//     const rows = hops.flatMap((hop) => {
//       const ttl = hop.ttl;
//       const series = hop.series;

//       return series.flatMap((probes) =>
//         probes.map((probe) => ({
//           target,
//           host,
//           ttl,
//           proto: probe.proto,
//           ip: probe.src,
//           rtt: probe.rtt,
//           lat: probe.lat,
//           lon: probe.lon,
//         }))
//       );
//     });

//     acc[target] = { host, hops: rows };
//     return acc;
//   }, {});

//   const allHops = Object.values(grouped).flatMap((entry) => entry.hops);

//   return (
//     <div className="result-wrapper">
//       <div className="result-panel">
//         <h1 className="result-title">Trace Results</h1>
//         <div className="result-content">
//           <div className="result-left">
//             {Object.entries(grouped).map(([target, { host, hops }], idx) => (
//               <div key={idx} className="result-card">
//                 <h2 className="result-subtitle">
//                   {target} {host && <span>({host})</span>}
//                 </h2>
//                 <table className="result-table">
//                   <thead>
//                     <tr>
//                       <th>TTL</th>
//                       <th>Protocol</th>
//                       <th>Router IP</th>
//                       <th>RTT (ms)</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {hops.map((entry, i) => (
//                       <tr
//   key={i}
//   onClick={() => setFocusedHop(entry)}
//   style={{ cursor: "pointer" }}
// >
//   <td>{entry.ttl}</td>
//   <td>{entry.proto}</td>
//   <td
//   data-tip={
//     entry.ip
//       ? entry.lat && entry.lon
//         ? `Located at (${entry.lat.toFixed(2)}, ${entry.lon.toFixed(2)})`
//         : "Private IP – cannot be visualized on the map."
//       : "No IP"
//   }
//   data-for={`tooltip-${i}`}
// >
//   {entry.ip || "N/A"}
//   <ReactTooltip id={`tooltip-${i}`} effect="solid" />
// </td>

//   <td>{entry.rtt != null ? entry.rtt.toFixed(2) : "timeout"}</td>
// </tr>

//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             ))}
//           </div>
//           <div className="result-map">
//             <h2 className="result-subtitle text-center">Interactive Map</h2>
//             <TraceMap hops={allHops} focus={focusedHop} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




// import React, { useState } from "react";
// import { useLocation } from "react-router-dom";
// import TraceMap from "../components/TraceMap";
// import "./Result.css";

// export default function Result() {
//   const location = useLocation();
//   const data = location.state?.data;
//   const [focusedHop, setFocusedHop] = useState(null);
//   const [searchTerm, setSearchTerm] = useState(""); // NEW: search bar state

//   if (!data || typeof data !== "object") {
//     return (
//       <div className="result-wrapper">
//         <p className="error-message">No result data received.</p>
//       </div>
//     );
//   }

//   const grouped = Object.entries(data).reduce((acc, [target, result]) => {
//     const host = result.host || "";
//     const hops = result.hops || [];

//     const rows = hops.flatMap((hop) => {
//       const ttl = hop.ttl;
//       const series = hop.series;

//       return series.flatMap((probes) =>
//         probes.map((probe) => ({
//           target,
//           host,
//           ttl,
//           proto: probe.proto,
//           ip: probe.src,
//           rtt: probe.rtt,
//           lat: probe.lat,
//           lon: probe.lon,
//         }))
//       );
//     });

//     acc[target] = { host, hops: rows };
//     return acc;
//   }, {});

//   const allHops = Object.values(grouped).flatMap((entry) => entry.hops);

//   return (
//     <div className="result-wrapper">
//       <div className="result-panel">
//         <h1 className="result-title">Trace Results</h1>
//         <div className="result-content">
//           <div className="result-left">
//             {/* ✅ Search Bar */}
//             <input
//               type="text"
//               placeholder="Search by IP or Hostname..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               style={{
//                 width: "100%",
//                 padding: "10px",
//                 marginBottom: "20px",
//                 fontSize: "1rem",
//                 borderRadius: "8px",
//                 border: "1px solid #333",
//                 backgroundColor: "#111",
//                 color: "#fff",
//                 fontFamily: "'Times New Roman', serif",
//               }}
//             />

//             {/* ✅ Filtered Result Table Cards */}
//             {Object.entries(grouped)
//               .filter(([target, { host }]) =>
//                 target.includes(searchTerm) || host.includes(searchTerm)
//               )
//               .map(([target, { host, hops }], idx) => (
//                 <div key={idx} className="result-card">
//                   <h2 className="result-subtitle">
//                     {target} {host && <span>({host})</span>}
//                   </h2>
//                   <table className="result-table">
//                     <thead>
//                       <tr>
//                         <th>TTL</th>
//                         <th>Protocol</th>
//                         <th>Router IP</th>
//                         <th>RTT (ms)</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {hops.map((entry, i) => (
//                         <tr
//                           key={i}
//                           onClick={() => setFocusedHop(entry)}
//                           style={{ cursor: "pointer" }}
//                         >
//                           <td>{entry.ttl}</td>
//                           <td>{entry.proto}</td>
//                           <td>{entry.ip || "N/A"}</td>
//                           <td>
//                             {entry.rtt != null
//                               ? entry.rtt.toFixed(2)
//                               : "timeout"}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               ))}
//           </div>
//           <div className="result-map">
//             <h2 className="result-subtitle text-center">Interactive Map</h2>
//             <TraceMap hops={allHops} focus={focusedHop} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




// import React, { useState } from "react";
// import { useLocation } from "react-router-dom";
// import TraceMap from "../components/TraceMap";
// import "./Result.css";

// export default function Result() {
//   const location = useLocation();
//   const data = location.state?.data;
//   const [focusedHop, setFocusedHop] = useState(null);
//   const [playingTarget, setPlayingTarget] = useState(null); // NEW
//   const [searchTerm, setSearchTerm] = useState("");

//   if (!data || typeof data !== "object") {
//     return (
//       <div className="result-wrapper">
//         <p className="error-message">No result data received.</p>
//       </div>
//     );
//   }

//   const grouped = Object.entries(data).reduce((acc, [target, result]) => {
//     const host = result.host || "";
//     const hops = result.hops || [];

//     const rows = hops.flatMap((hop) => {
//       const ttl = hop.ttl;
//       const series = hop.series;

//       return series.flatMap((probes) =>
//         probes.map((probe) => ({
//           target,
//           host,
//           ttl,
//           proto: probe.proto,
//           ip: probe.src,
//           rtt: probe.rtt,
//           lat: probe.lat,
//           lon: probe.lon,
//         }))
//       );
//     });

//     acc[target] = { host, hops: rows };
//     return acc;
//   }, {});

//   const allHops = Object.values(grouped).flatMap((entry) => entry.hops);

//   return (
//     <div className="result-wrapper">
//       <div className="result-panel">
//         <h1 className="result-title">Trace Results</h1>
//         <div className="result-content">
//           <div className="result-left">
//             <input
//               type="text"
//               placeholder="Search by IP or Hostname..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               style={{
//                 width: "100%",
//                 padding: "10px",
//                 marginBottom: "20px",
//                 fontSize: "1rem",
//                 borderRadius: "8px",
//                 border: "1px solid #333",
//                 backgroundColor: "#111",
//                 color: "#fff",
//                 fontFamily: "'Times New Roman', serif",
//               }}
//             />

//             {Object.entries(grouped)
//               .filter(([target, { host }]) =>
//                 target.includes(searchTerm) || host.includes(searchTerm)
//               )
//               .map(([target, { host, hops }], idx) => (
//                 <div key={idx} className="result-card">
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "center",
//                     }}
//                   >
//                     <h2 className="result-subtitle" style={{ margin: 0 }}>
//                       {target} {host && <span>({host})</span>}
//                     </h2>
//                     <button
//                       onClick={() => {
//                         setFocusedHop(null);
//                         setPlayingTarget(target);
//                       }}
//                       style={{
//                         padding: "6px 12px",
//                         borderRadius: "8px",
//                         backgroundColor: "#00f2ff",
//                         border: "none",
//                         fontFamily: "'Orbitron', sans-serif",
//                         fontWeight: "bold",
//                         color: "#000",
//                         cursor: "pointer",
//                         boxShadow: "0 0 6px #00f2ff",
//                       }}
//                     >
//                       Play
//                     </button>
//                   </div>

//                   <table className="result-table">
//                     <thead>
//                       <tr>
//                         <th>TTL</th>
//                         <th>Protocol</th>
//                         <th>Router IP</th>
//                         <th>RTT (ms)</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {hops.map((entry, i) => (
//                         <tr
//                           key={i}
//                           onClick={() => setFocusedHop(entry)}
//                           style={{ cursor: "pointer" }}
//                         >
//                           <td>{entry.ttl}</td>
//                           <td>{entry.proto}</td>
//                           <td>{entry.ip || "N/A"}</td>
//                           <td>
//                             {entry.rtt != null
//                               ? entry.rtt.toFixed(2)
//                               : "timeout"}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               ))}
//           </div>
//           <div className="result-map">
//             <h2 className="result-subtitle text-center">Interactive Map</h2>
//             <TraceMap
//               hops={allHops}
//               focus={focusedHop}
//               playingTarget={playingTarget}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




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
    <div className="result-wrapper">
      <div className="result-panel">
        <h1 className="result-title">Trace Results</h1>

        {/* 🆕 Download button dropdown */}
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
            {/* ✅ Search bar */}
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

            {/* ✅ Destination Tables */}
            {Object.entries(grouped)
              .filter(([target, { host }]) =>
                target.includes(searchTerm) || host.includes(searchTerm)
              )
              .map(([target, { host, hops }], idx) => (
                <div key={idx} className="result-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h2 className="result-subtitle" style={{ margin: 0 }}>
                      {target} {host && <span>({host})</span>}
                    </h2>
                    <button
                      onClick={() => {
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
                </div>
              ))}
          </div>

          {/* ✅ Map Panel */}
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
