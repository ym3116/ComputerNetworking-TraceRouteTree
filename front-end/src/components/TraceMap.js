// // front-end/src/components/TraceMap.js
// import React, { useState } from "react";
// import { useMap, MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
// import { useEffect } from "react";
// import L from "leaflet";

// export default function TraceMap({ hops, focus }) {
//   const [showTCP, setShowTCP] = useState(true);
//   const [showUDP, setShowUDP] = useState(true);
//   const [showICMP, setShowICMP] = useState(true);

//   const colors = { TCP: "red", UDP: "blue", ICMP: "green" };
//   const show = { TCP: showTCP, UDP: showUDP, ICMP: showICMP };

//   const filtered = hops.filter(h => show[h.proto] && h.lat && h.lon);

//   const grouped = Object.entries(
//     filtered.reduce((acc, h) => {
//       if (!acc[h.proto]) acc[h.proto] = [];
//       acc[h.proto].push(h);
//       return acc;
//     }, {})
//   );

//   function FlyTo({ lat, lon }) {
//     const map = useMap();
  
//     useEffect(() => {
//       if (lat != null && lon != null) {
//         map.flyTo([lat, lon], 10);
//       }
//     }, [lat, lon, map]);
  
//     return null;
//   }
  

//   return (
//     <div>
//       <div style={{ marginBottom: 10 }}>
//         <label><input type="checkbox" checked={showTCP} onChange={() => setShowTCP(!showTCP)} /> TCP </label>
//         <label><input type="checkbox" checked={showUDP} onChange={() => setShowUDP(!showUDP)} /> UDP </label>
//         <label><input type="checkbox" checked={showICMP} onChange={() => setShowICMP(!showICMP)} /> ICMP </label>
//       </div>

//       <MapContainer center={[30, 0]} zoom={2} scrollWheelZoom style={{ height: "500px", width: "100%" }}>
//         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//         {focus && <FlyTo lat={focus.lat} lon={focus.lon} />}
        
//         {grouped.map(([proto, pts], i) => (
//           <Polyline key={i} positions={pts.map(p => [p.lat, p.lon])} color={colors[proto]} />
//         ))}

//         {filtered.map((h, i) => (
//           <Marker key={i} position={[h.lat, h.lon]} icon={L.icon({ iconUrl: "https://leafletjs.com/examples/custom-icons/leaf-red.png", iconSize: [25, 41] })}>
//             <Popup>
//               <b>{h.proto}</b><br />
//               IP: {h.ip}<br />
//               RTT: {h.rtt ? h.rtt.toFixed(2) + " ms" : "timeout"}
//             </Popup>
//           </Marker>
//         ))}
//       </MapContainer>
//     </div>
//   );
// }







// // This works at 10:31!
// // front-end/src/components/TraceMap.js
// import React, { useEffect, useState } from "react";
// import { useMap, MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
// import L from "leaflet";




// export default function TraceMap({ hops, focus }) {
//   const [showTCP, setShowTCP] = useState(true);
//   const [showUDP, setShowUDP] = useState(true);
//   const [showICMP, setShowICMP] = useState(true);

//   const colors = { TCP: "red", UDP: "blue", ICMP: "green" };
//   const show = { TCP: showTCP, UDP: showUDP, ICMP: showICMP };

//   const filtered = hops.filter((h) => show[h.proto] && h.lat && h.lon);

//   const hiddenHops = hops.filter((h) => h.lat == null || h.lon == null);

//   const grouped = Object.entries(
//     filtered.reduce((acc, h) => {
//       if (!acc[h.proto]) acc[h.proto] = [];
//       acc[h.proto].push(h);
//       return acc;
//     }, {})
//   );

//   // ⬇️ Helper for flying to focus point
//   function FlyTo({ focus }) {
//     const map = useMap();

//     useEffect(() => {
//       if (focus?.lat != null && focus?.lon != null) {
//         map.flyTo([focus.lat, focus.lon], 10, {
//           duration: 1.2,
//         });
//       }
//     }, [focus, map]);

//     return null;
//   }

//   return (
//     <div>
//       <div style={{ marginBottom: 10, color: "#00f2ff" }}>
//         <label>
//           <input
//             type="checkbox"
//             checked={showTCP}
//             onChange={() => setShowTCP(!showTCP)}
//           />{" "}
//           TCP
//         </label>{" "}
//         <label>
//           <input
//             type="checkbox"
//             checked={showUDP}
//             onChange={() => setShowUDP(!showUDP)}
//           />{" "}
//           UDP
//         </label>{" "}
//         <label>
//           <input
//             type="checkbox"
//             checked={showICMP}
//             onChange={() => setShowICMP(!showICMP)}
//           />{" "}
//           ICMP
//         </label>
//       </div>




//       {hiddenHops.length > 0 && (
//   <div
//     style={{
//       backgroundColor: "rgba(255, 0, 0, 0.1)",
//       border: "1px solid #f00",
//       padding: "10px 15px",
//       marginBottom: "15px",
//       borderRadius: "8px",
//       color: "#ff4d4d",
//       fontWeight: "bold",
//       fontFamily: "'Orbitron', sans-serif",
//       boxShadow: "0 0 8px #ff4d4d",
//     }}
//   >
//     {hiddenHops.length} router IP{hiddenHops.length > 1 ? "s" : ""} could not be
//     visualized on the map (likely private or unresolved IPs).
//   </div>
// )}




//       <MapContainer
//         center={[30, 0]}
//         zoom={2}
//         scrollWheelZoom={true}
//         style={{ height: "500px", width: "100%", borderRadius: "12px" }}
//       >
// <TileLayer
//   url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
//   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
// />



//         {/* ⬇️ Focus transition */}
//         {focus && <FlyTo focus={focus} />}

//         {grouped.map(([proto, pts], i) => (
//           <Polyline
//             key={i}
//             positions={pts.map((p) => [p.lat, p.lon])}
//             color={colors[proto]}
//           />
//         ))}

//         {filtered.map((h, i) => (
//           <Marker
//             key={i}
//             position={[h.lat, h.lon]}
//             icon={
//               focus?.lat === h.lat && focus?.lon === h.lon
//                 ? L.icon({
//                     iconUrl: "https://leafletjs.com/examples/custom-icons/leaf-orange.png",
//                     iconSize: [30, 48],
//                     iconAnchor: [15, 48],
//                   })
//                 : L.icon({
//                     iconUrl: "https://leafletjs.com/examples/custom-icons/leaf-red.png",
//                     iconSize: [25, 41],
//                     iconAnchor: [12, 41],
//                   })
//             }
//           >
//             <Popup>
//               <b>{h.proto}</b>
//               <br />
//               IP: {h.ip}
//               <br />
//               RTT: {h.rtt ? h.rtt.toFixed(2) + " ms" : "timeout"}
//             </Popup>
//           </Marker>
//         ))}
//       </MapContainer>
//     </div>
//   );
// }










// // 10:36 very primitive version of the hopping demonstration
// import React, { useState, useEffect } from "react";
// import {
//   useMap,
//   MapContainer,
//   TileLayer,
//   Marker,
//   Polyline,
//   Popup,
// } from "react-leaflet";
// import L from "leaflet";

// // Default Leaflet marker icons (optional fallback)
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
//   iconUrl: require("leaflet/dist/images/marker-icon.png"),
//   shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
// });

// export default function TraceMap({ hops, focus }) {
//   const [showTCP, setShowTCP] = useState(true);
//   const [showUDP, setShowUDP] = useState(true);
//   const [showICMP, setShowICMP] = useState(true);

//   const [visibleTTL, setVisibleTTL] = useState(null); // 🆕 controls animation TTL
//   const [isPlaying, setIsPlaying] = useState(false);  // 🆕 play state

//   const colors = { TCP: "red", UDP: "blue", ICMP: "green" };
//   const show = { TCP: showTCP, UDP: showUDP, ICMP: showICMP };

//   const filtered = hops.filter((h) => show[h.proto] && h.lat && h.lon);
//   const hiddenHops = hops.filter((h) => h.lat == null || h.lon == null);

//   const grouped = Object.entries(
//     filtered.reduce((acc, h) => {
//       if (!acc[h.proto]) acc[h.proto] = [];
//       acc[h.proto].push(h);
//       return acc;
//     }, {})
//   );

//   // Zoom to selected router
//   function FlyTo({ focus }) {
//     const map = useMap();
//     useEffect(() => {
//       if (focus?.lat != null && focus?.lon != null) {
//         map.flyTo([focus.lat, focus.lon], 10, { duration: 1.2 });
//       }
//     }, [focus, map]);
//     return null;
//   }

//   // Animation logic
//   function startAnimation() {
//     if (isPlaying) return;
//     setIsPlaying(true);
//     setVisibleTTL(null);

//     const maxTTL = Math.max(...hops.map((h) => h.ttl));
//     let ttl = 1;

//     const interval = setInterval(() => {
//       setVisibleTTL(ttl);
//       ttl += 1;
//       if (ttl > maxTTL) {
//         clearInterval(interval);
//         setIsPlaying(false);
//       }
//     }, 500);
//   }

//   return (
//     <div>
//       {/* Protocol toggles */}
//       <div style={{ marginBottom: 10, color: "#00f2ff", fontFamily: "'Orbitron', sans-serif" }}>
//         <label>
//           <input type="checkbox" checked={showTCP} onChange={() => setShowTCP(!showTCP)} /> TCP
//         </label>{" "}
//         <label>
//           <input type="checkbox" checked={showUDP} onChange={() => setShowUDP(!showUDP)} /> UDP
//         </label>{" "}
//         <label>
//           <input type="checkbox" checked={showICMP} onChange={() => setShowICMP(!showICMP)} /> ICMP
//         </label>
//       </div>

//       {/* Warning for skipped IPs */}
//       {hiddenHops.length > 0 && (
//         <div
//           style={{
//             backgroundColor: "rgba(255, 0, 0, 0.1)",
//             border: "1px solid #f00",
//             padding: "10px 15px",
//             marginBottom: "15px",
//             borderRadius: "8px",
//             color: "#ff4d4d",
//             fontWeight: "bold",
//             fontFamily: "'Orbitron', sans-serif",
//             boxShadow: "0 0 8px #ff4d4d",
//           }}
//         >
//           {hiddenHops.length} router IP{hiddenHops.length > 1 ? "s" : ""} could not be
//           visualized on the map (likely private or unresolved IPs).
//         </div>
//       )}

//       {/* Play button */}
//       {filtered.length > 0 && (
//         <div style={{ marginBottom: 12 }}>
//           <button
//             onClick={startAnimation}
//             disabled={isPlaying}
//             style={{
//               backgroundColor: "#00f2ff",
//               border: "none",
//               padding: "8px 16px",
//               borderRadius: "8px",
//               fontFamily: "'Orbitron', sans-serif",
//               fontWeight: "bold",
//               color: "#000",
//               boxShadow: "0 0 8px #00f2ff",
//               cursor: "pointer",
//               opacity: isPlaying ? 0.6 : 1,
//             }}
//           >
//             {isPlaying ? "Playing..." : "Play Trace"}
//           </button>
//         </div>
//       )}

//       {/* The map */}
//       <MapContainer
//         center={[30, 0]}
//         zoom={2}
//         scrollWheelZoom
//         style={{ height: "500px", width: "100%", borderRadius: "12px" }}
//       >
// <TileLayer
//   url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
//   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
// />

//         {focus && <FlyTo focus={focus} />}

//         {/* Polylines */}
//         {grouped.map(([proto, pts], i) => (
//           <Polyline
//             key={i}
//             positions={pts.map((p) => [p.lat, p.lon])}
//             color={colors[proto]}
//           />
//         ))}

//         {/* Markers: animated by TTL */}
//         {filtered
//           .filter((h) => visibleTTL == null || h.ttl <= visibleTTL)
//           .map((h, i) => (
//             <Marker
//               key={i}
//               position={[h.lat, h.lon]}
//               icon={
//                 focus?.lat === h.lat && focus?.lon === h.lon
//                   ? L.icon({
//                       iconUrl:
//                         "https://leafletjs.com/examples/custom-icons/leaf-orange.png",
//                       iconSize: [30, 48],
//                       iconAnchor: [15, 48],
//                     })
//                   : L.icon({
//                       iconUrl:
//                         "https://leafletjs.com/examples/custom-icons/leaf-red.png",
//                       iconSize: [25, 41],
//                       iconAnchor: [12, 41],
//                     })
//               }
//             >
//               <Popup>
//                 <b>{h.proto}</b>
//                 <br />
//                 IP: {h.ip}
//                 <br />
//                 RTT: {h.rtt != null ? h.rtt.toFixed(2) + " ms" : "timeout"}
//               </Popup>
//             </Marker>
//           ))}
//       </MapContainer>
//     </div>
//   );
// }




import React, { useState, useEffect } from "react";
import {
  useMap,
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import L from "leaflet";

export default function TraceMap({ hops, focus, playingTarget }) {
  const [showTCP, setShowTCP] = useState(true);
  const [showUDP, setShowUDP] = useState(true);
  const [showICMP, setShowICMP] = useState(true);
  const [visibleTTL, setVisibleTTL] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const show = { TCP: showTCP, UDP: showUDP, ICMP: showICMP };
  const colors = { TCP: "red", UDP: "blue", ICMP: "green" };

  const hopsForTarget = playingTarget
    ? hops.filter((h) => h.target === playingTarget)
    : [];

  const filtered = hopsForTarget.filter((h) => show[h.proto] && h.lat && h.lon);
  const hidden = hopsForTarget.filter((h) => h.lat == null || h.lon == null);
  const maxTTL = Math.max(...filtered.map((h) => h.ttl || 0));
  const mapCenter = [30, 0];

  const filteredUpToTTL = filtered.filter(
    (h) => visibleTTL == null || h.ttl <= visibleTTL
  );

  const groupedByProto = Object.entries(
    filteredUpToTTL.reduce((acc, h) => {
      if (!acc[h.proto]) acc[h.proto] = [];
      acc[h.proto].push(h);
      return acc;
    }, {})
  );

  function FlyToHop({ currentHop }) {
    const map = useMap();
    useEffect(() => {
      if (currentHop?.lat && currentHop?.lon) {
        map.flyTo([currentHop.lat, currentHop.lon], 5, { duration: 1 });
      }
    }, [currentHop, map]);
    return null;
  }

  function startAnimation() {
    if (isPlaying || !playingTarget) return;
    setIsPlaying(true);
    setVisibleTTL(null);

    let ttl = 1;
    const interval = setInterval(() => {
      setVisibleTTL(ttl);
      ttl += 1;
      if (ttl > maxTTL) {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 500);
  }

  const currentHop = filtered.find((h) => h.ttl === visibleTTL);

  return (
    <div>
      <div style={{ marginBottom: 10, color: "#00f2ff", fontFamily: "'Orbitron', sans-serif" }}>
        <label>
          <input type="checkbox" checked={showTCP} onChange={() => setShowTCP(!showTCP)} /> TCP
        </label>{" "}
        <label>
          <input type="checkbox" checked={showUDP} onChange={() => setShowUDP(!showUDP)} /> UDP
        </label>{" "}
        <label>
          <input type="checkbox" checked={showICMP} onChange={() => setShowICMP(!showICMP)} /> ICMP
        </label>
      </div>

      {hidden.length > 0 && (
        <div
          style={{
            backgroundColor: "rgba(255, 0, 0, 0.1)",
            border: "1px solid #f00",
            padding: "10px 15px",
            marginBottom: "15px",
            borderRadius: "8px",
            color: "#ff4d4d",
            fontWeight: "bold",
            fontFamily: "'Orbitron', sans-serif",
            boxShadow: "0 0 8px #ff4d4d",
          }}
        >
          {hidden.length} router IP{hidden.length > 1 ? "s" : ""} could not be
          visualized on the map.
        </div>
      )}

      {playingTarget && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={startAnimation}
            disabled={isPlaying}
            style={{
              backgroundColor: "#00f2ff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: "bold",
              color: "#000",
              boxShadow: "0 0 8px #00f2ff",
              cursor: "pointer",
              opacity: isPlaying ? 0.6 : 1,
            }}
          >
            {isPlaying ? "Playing..." : `Play Trace for ${playingTarget}`}
          </button>
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={2}
        scrollWheelZoom
        style={{ height: "500px", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        />

        {visibleTTL != null && currentHop && <FlyToHop currentHop={currentHop} />}

        {groupedByProto.map(([proto, pts], i) => {
          const segments = [];
          for (let j = 1; j < pts.length; j++) {
            const prev = pts[j - 1];
            const curr = pts[j];
            if (
              prev.lat != null && prev.lon != null &&
              curr.lat != null && curr.lon != null &&
              prev.ttl <= visibleTTL && curr.ttl <= visibleTTL
            ) {
              segments.push([[prev.lat, prev.lon], [curr.lat, curr.lon]]);
            }
          }
          return segments.map((line, k) => (
            <Polyline key={`${i}-${k}`} positions={line} color={colors[proto]} />
          ));
        })}

        {filteredUpToTTL.map((h, i) => (
          <Marker
            key={i}
            position={[h.lat, h.lon]}
            icon={
              focus?.lat === h.lat && focus?.lon === h.lon
                ? L.icon({
                    iconUrl: "https://leafletjs.com/examples/custom-icons/leaf-orange.png",
                    iconSize: [30, 48],
                    iconAnchor: [15, 48],
                  })
                : L.icon({
                    iconUrl: "https://leafletjs.com/examples/custom-icons/leaf-red.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                  })
            }
          >
            <Popup>
              <b>{h.proto}</b>
              <br />
              IP: {h.ip}
              <br />
              RTT: {h.rtt != null ? h.rtt.toFixed(2) + " ms" : "timeout"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}