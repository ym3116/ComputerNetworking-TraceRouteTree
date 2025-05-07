// front-end/src/components/TraceMap.js
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";

export default function TraceMap({ hops }) {
  const [showTCP, setShowTCP] = useState(true);
  const [showUDP, setShowUDP] = useState(true);
  const [showICMP, setShowICMP] = useState(true);

  const colors = { TCP: "red", UDP: "blue", ICMP: "green" };
  const show = { TCP: showTCP, UDP: showUDP, ICMP: showICMP };

  const filtered = hops.filter(h => show[h.proto] && h.lat && h.lon);

  const grouped = Object.entries(
    filtered.reduce((acc, h) => {
      if (!acc[h.proto]) acc[h.proto] = [];
      acc[h.proto].push(h);
      return acc;
    }, {})
  );

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <label><input type="checkbox" checked={showTCP} onChange={() => setShowTCP(!showTCP)} /> TCP </label>
        <label><input type="checkbox" checked={showUDP} onChange={() => setShowUDP(!showUDP)} /> UDP </label>
        <label><input type="checkbox" checked={showICMP} onChange={() => setShowICMP(!showICMP)} /> ICMP </label>
      </div>

      <MapContainer center={[30, 0]} zoom={2} scrollWheelZoom style={{ height: "500px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {grouped.map(([proto, pts], i) => (
          <Polyline key={i} positions={pts.map(p => [p.lat, p.lon])} color={colors[proto]} />
        ))}

        {filtered.map((h, i) => (
          <Marker key={i} position={[h.lat, h.lon]} icon={L.icon({ iconUrl: "https://leafletjs.com/examples/custom-icons/leaf-red.png", iconSize: [25, 41] })}>
            <Popup>
              <b>{h.proto}</b><br />
              IP: {h.ip}<br />
              RTT: {h.rtt ? h.rtt.toFixed(2) + " ms" : "timeout"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
