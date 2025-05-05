# interactive_viz.py – world‑map visualiser that replaces the old spring‑layout graph
# -----------------------------------------------------------------------------
# It produces a self‑contained Leaflet HTML file with every hop geolocated and
# colour‑coded by protocol (UDP blue, TCP green, ICMP orange).
# -----------------------------------------------------------------------------

import os
import json
import statistics
from pathlib import Path
from functools import lru_cache
from typing import Dict, Any, Tuple, List

import folium  # pip install folium
import ipinfo  # pip install ipinfo

# ──────────────────────────────────────────────────────────────────────────────
# 1.  Lightweight IP → (lat, lon, label) resolver (cached)
# ──────────────────────────────────────────────────────────────────────────────

TOKEN: str = os.getenv("IPINFO_TOKEN", "e284973a5f42ee")  # demo token (60‑req/hr)
_handler = ipinfo.getHandler(TOKEN, cache_options={"ttl": 3600})  # 1 h cache

@lru_cache(maxsize=10_000)
def ip_geo(ip: str) -> Tuple[float | None, float | None, str]:
    """Return (lat, lon, label) or (None, None, '') if lookup fails."""
    try:
        details = _handler.getDetails(ip)
        if details.latitude and details.longitude:
            label = ", ".join(filter(None, (details.city, details.region, details.country)))
            return float(details.latitude), float(details.longitude), label
    except Exception:
        pass
    return None, None, ""

# ──────────────────────────────────────────────────────────────────────────────
# 2.  Build the Folium / Leaflet map
# ──────────────────────────────────────────────────────────────────────────────

PROTO_COLOR: Dict[str, str] = {"UDP": "blue", "TCP": "green", "ICMP": "orange"}

def build_map(results: Dict[str, Any], outfile: str = "tracetree_map.html") -> Path:
    """Convert aggregated trace results into an interactive world map."""

    # centre: use median of all successfully geolocated nodes for a sensible zoom
    coords: List[Tuple[float, float]] = [
        (lat, lon)
        for dest in results.values()
        for hop in dest["hops"]
        for series in hop["series"]
        for p in series if p.get("src")
        if (lat := ip_geo(p["src"])[0]) is not None and (lon := ip_geo(p["src"])[1]) is not None
    ]
    centre_lat = statistics.median([c[0] for c in coords]) if coords else 0
    centre_lon = statistics.median([c[1] for c in coords]) if coords else 0

    m = folium.Map(location=(centre_lat, centre_lon), zoom_start=2, tiles="CartoDB positron")

    # toggle‑able layers: one per protocol
    layers = {proto: folium.FeatureGroup(name=f"{proto} links", show=True) for proto in PROTO_COLOR}
    for layer in layers.values():
        m.add_child(layer)

    # keep track of which nodes we've already drawn
    drawn_nodes: set[str] = set()

    for dest_ip, dest_data in results.items():
        prev_lat = prev_lon = None
        for hop in dest_data["hops"]:
            # pick the first replied packet in this hop for location
            pkt = next((p for series in hop["series"] for p in series if p.get("src")), None)
            if not pkt:
                continue
            ip = pkt["src"]
            lat, lon, label = ip_geo(ip)
            if lat is None:
                continue  # skip if geolocation failed

            # draw node if new
            if ip not in drawn_nodes:
                tooltip = f"{ip}\n{label}" if label else ip
                folium.CircleMarker(
                    location=(lat, lon), radius=4,
                    color="#555", fill=True, fill_color="#f03", fill_opacity=0.9,
                    tooltip=tooltip,
                    popup=folium.Popup(f"<b>{ip}</b><br>{label}", max_width=200)
                ).add_to(m)
                drawn_nodes.add(ip)

            # draw edges for each protocol that answered (use first RTT sample)
            for series in hop["series"]:
                sample = next((p for p in series if p.get("rtt") is not None), None)
                if not sample:
                    continue
                proto = sample["proto"]
                color = PROTO_COLOR.get(proto, "gray")
                rtt_ms = round(sample["rtt"] * 1000, 1)
                if prev_lat is not None and prev_lon is not None:
                    layers[proto].add_child(
                        folium.PolyLine(
                            [(prev_lat, prev_lon), (lat, lon)],
                            color=color, weight=2, opacity=0.7,
                            tooltip=f"{proto} RTT ≈ {rtt_ms} ms"
                        )
                    )
            prev_lat, prev_lon = lat, lon

    folium.LayerControl(collapsed=False).add_to(m)
    m.save(outfile)
    return Path(outfile).resolve()

# ──────────────────────────────────────────────────────────────────────────────
# 3.  Convenience CLI  (allows `python interactive_viz.py raw.json`)
# ──────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys, webbrowser

    if len(sys.argv) < 2:
        print("Usage: python interactive_viz.py raw_results.json [outfile.html]")
        sys.exit(1)

    fn_in = sys.argv[1]
    fn_out = sys.argv[2] if len(sys.argv) > 2 else "tracetree_map.html"

    with open(fn_in, "r", encoding="utf-8") as f:
        trace_data = json.load(f)

    html_path = build_map(trace_data, fn_out)
    print(f"✓ Wrote {html_path}")
    webbrowser.open(html_path.as_uri())
