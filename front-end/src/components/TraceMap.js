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


const iconShadow = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png";

const protocolIcons = {
  TCP: L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: iconShadow,
    iconSize: [20, 32],
    iconAnchor: [10, 32],
    popupAnchor: [1, -28],
    shadowSize: [41, 41],
  }),
  UDP: L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
    shadowUrl: iconShadow,
    iconSize: [20, 32],
    iconAnchor: [10, 32],
    popupAnchor: [1, -28],
    shadowSize: [41, 41],
  }),
  ICMP: L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: iconShadow,
    iconSize: [20, 32],
    iconAnchor: [10, 32],
    popupAnchor: [1, -28],
    shadowSize: [41, 41],
  }),
};

const destinationIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});



export default function TraceMap({ hops, focus, playingTarget }) {
  const [showTCP, setShowTCP] = useState(true);
  const [showUDP, setShowUDP] = useState(true);
  const [showICMP, setShowICMP] = useState(true);
  const [visibleTTL, setVisibleTTL] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasFlownToFocus, setHasFlownToFocus] = useState(false);

  const show = { TCP: showTCP, UDP: showUDP, ICMP: showICMP };
  const colors = { TCP: "red", UDP: "blue", ICMP: "green" };

  const hopsForTarget = playingTarget
    ? hops.filter((h) => h.target === playingTarget)
    : [];

  const destinationHop = hopsForTarget
    .slice()
    .reverse()
    .find((h) => h.lat != null && h.lon != null);

  const filtered = hopsForTarget.filter((h) => show[h.proto] && h.lat && h.lon);
  const hidden = hopsForTarget.filter((h) => h.lat == null || h.lon == null);
  const maxTTL = Math.max(...filtered.map((h) => h.ttl || 0));
  const mapCenter = [30, 0];

  const currentHop = filtered.find((h) => h.ttl === visibleTTL);
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

  useEffect(() => {
    if (focus) setHasFlownToFocus(false);
  }, [focus]);

  function FlyToHop({ currentHop }) {
    const map = useMap();
    useEffect(() => {
      if (currentHop?.lat && currentHop?.lon && !hasFlownToFocus) {
        map.flyTo([currentHop.lat, currentHop.lon], 10, { duration: 1 });
      }
    }, [currentHop, hasFlownToFocus, map]);
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

  function getFocusedIcon(proto) {
    const urlMap = {
      TCP: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
      UDP: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
      ICMP: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    };
  
    const iconUrl = urlMap[proto] || urlMap.TCP;
  
    return L.icon({
      iconUrl,
      shadowUrl: iconShadow,
      iconSize: [28, 45],
      iconAnchor: [14, 45],
      popupAnchor: [1, -38],
      shadowSize: [41, 41],
    });
  }

  function getHoverIcon(proto) {
    const urlMap = {
      TCP: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
      UDP: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
      ICMP: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    };
  
    const iconUrl = urlMap[proto] || urlMap.TCP;
  
    return L.icon({
      iconUrl,
      shadowUrl: iconShadow,
      iconSize: [24, 38],      
      iconAnchor: [12, 38],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }
  

  return (
    <div>
      <div style={{ marginBottom: 10, color: "#00f2ff", fontFamily: "'Orbitron', sans-serif" }}>
        <label><input type="checkbox" checked={showTCP} onChange={() => setShowTCP(!showTCP)} /> TCP</label>{" "}
        <label><input type="checkbox" checked={showUDP} onChange={() => setShowUDP(!showUDP)} /> UDP</label>{" "}
        <label><input type="checkbox" checked={showICMP} onChange={() => setShowICMP(!showICMP)} /> ICMP</label>
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

        {focus && <FlyToHop currentHop={focus} />}

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

        {filteredUpToTTL
          .filter(
            (h) =>
              !destinationHop || 
              h.lat !== destinationHop.lat || h.lon !== destinationHop.lon
          )
          .map((h, i) => (
            <Marker
              key={i}
              position={[h.lat, h.lon]}
              icon={
                focus?.lat === h.lat && focus?.lon === h.lon
                  ? getHoverIcon(h.proto)
                  : protocolIcons[h.proto] || protocolIcons.TCP
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

        {destinationHop && (
          <Marker
            position={[destinationHop.lat, destinationHop.lon]}
            icon={destinationIcon}
          >
            <Popup>
              <b>Destination Server</b>
              <br />
              IP: {destinationHop.ip}
              <br />
              Protocol: {destinationHop.proto}
            </Popup>
          </Marker>
        )}

      </MapContainer>
    </div>
  );
}