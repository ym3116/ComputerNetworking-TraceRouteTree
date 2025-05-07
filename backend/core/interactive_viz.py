# interactive_viz.py – combined hop table + interactive world‑map
# -----------------------------------------------------------------------------
# Generates a single HTML page that has two panes:
#   1. A sortable table listing every hop (hostname, IP, RTT, location …)
#   2. A Leaflet map with the protocol‑coloured paths (same as before)
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
# 2.  Build map and hop‑table HTML snippets
# ──────────────────────────────────────────────────────────────────────────────

PROTO_COLOR: Dict[str, str] = {"UDP": "blue", "TCP": "green", "ICMP": "orange"}

def _build_map(results: Dict[str, Any], map_file: Path) -> None:
    """Create the Leaflet map and save to *map_file* (HTML fragment)."""
    # centre at median of coords
    coords = [
        (lat, lon)
        for dest in results.values()
        for hop in dest["hops"]
        for series in hop["series"]
        for p in series if p.get("src")
        if (lat := ip_geo(p["src"])[0]) is not None and (lon := ip_geo(p["src"])[1]) is not None
    ]
    centre_lat = statistics.median([c[0] for c in coords]) if coords else 0
    centre_lon = statistics.median([c[1] for c in coords]) if coords else 0

    m = folium.Map(location=(centre_lat, centre_lon), zoom_start=2, tiles=None, control_scale=True)
    folium.TileLayer("CartoDB positron", name="Light", control=False).add_to(m)

    layers = {proto: folium.FeatureGroup(name=f"{proto} links", show=True) for proto in PROTO_COLOR}
    for layer in layers.values():
        m.add_child(layer)

    drawn = set()
    for dest_ip, dest_data in results.items():
        prev_coord = None
        for hop in dest_data["hops"]:
            pkt = next((p for series in hop["series"] for p in series if p.get("src")), None)
            if not pkt:
                continue
            ip = pkt["src"]
            lat, lon, label = ip_geo(ip)
            if lat is None:
                continue
            if ip not in drawn:
                tooltip = f"{ip}\n{label}" if label else ip
                folium.CircleMarker((lat, lon), radius=4, color="#555", fill=True,
                                    fill_color="#f03", fill_opacity=0.9,
                                    tooltip=tooltip,
                                    popup=folium.Popup(f"<b>{ip}</b><br>{label}", max_width=200)
                                    ).add_to(m)
                drawn.add(ip)
            for series in hop["series"]:
                smpl = next((p for p in series if p.get("rtt") is not None), None)
                if not smpl or not prev_coord:
                    continue
                layers[smpl["proto"]].add_child(
                    folium.PolyLine([prev_coord, (lat, lon)], color=PROTO_COLOR[smpl["proto"]],
                                     weight=2, opacity=0.7,
                                     tooltip=f"{smpl['proto']} RTT ≈ {round(smpl['rtt']*1000,1)} ms")
                )
            prev_coord = (lat, lon)

    folium.LayerControl(collapsed=False).add_to(m)
    m.save(str(map_file))


def _build_table(results: Dict[str, Any]) -> str:
    """Return <table> HTML listing hops per destination."""
    headers = ["Dest", "Hop", "IP", "Hostname", "Avg RTT (ms)", "Location"]
    rows: List[str] = []
    for dest_ip, dest_data in results.items():
        dest_host = dest_data.get("host", "") or "—"
        for hop in dest_data["hops"]:
            ttl = hop["ttl"]
            pkts = [p for s in hop["series"] for p in s if p.get("rtt") is not None]
            if not pkts:
                continue
            avg_rtt = statistics.mean([p["rtt"] for p in pkts]) * 1000
            ip = pkts[0]["src"]
            lat, lon, label = ip_geo(ip)
            rows.append(
                f"<tr><td>{dest_host} ({dest_ip})</td><td>{ttl}</td><td>{ip}</td>"
                f"<td>{dest_host}</td><td>{avg_rtt:.1f}</td><td>{label}</td></tr>"
            )
    table_html = (
        "<table id='hopTable'><thead><tr>" + "".join(f"<th>{h}</th>" for h in headers) +
        "</tr></thead><tbody>" + "".join(rows) + "</tbody></table>"
    )
    return table_html

# ──────────────────────────────────────────────────────────────────────────────
# 3.  Build the final combined page
# ──────────────────────────────────────────────────────────────────────────────

def build_page(results: Dict[str, Any], outfile: str = "tracetree.html") -> Path:
    out_path = Path(outfile).resolve()
    map_file = out_path.with_name("_map_inner.html")

    # 1) create map fragment
    _build_map(results, map_file)

    # 2) create hop table
    table_html = _build_table(results)

    # 3) wrap into a simple flex layout
    style = """
    html,body{margin:0;height:100%;font-family:Arial,Helvetica,sans-serif}
    #container{display:flex;height:100%}
    #tablePane{width:35%;overflow:auto;padding:0 10px}
    #mapPane{flex:1}
    table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px}
    th{background:#f0f0f0;position:sticky;top:0}
    """

    html_doc = (
        "<!DOCTYPE html><html><head><meta charset='utf-8'><title>TraceViz</title>"
        f"<style>{style}</style></head><body>"
        "<div id='container'>"
        "  <div id='tablePane'>" + table_html + "</div>"
        "  <div id='mapPane'><iframe src='" + map_file.name + "' style='width:100%;height:100%;border:none'></iframe></div>"
        "</div></body></html>"
    )

    out_path.write_text(html_doc, encoding="utf-8")
    return out_path

# ──────────────────────────────────────────────────────────────────────────────
# 4.  CLI helper
# ──────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys, webbrowser
    if len(sys.argv) < 2:
        print("Usage: python interactive_viz.py raw_results.json [outfile.html]")
        sys.exit(1)
    fn_in = sys.argv[1]
    fn_out = sys.argv[2] if len(sys.argv) > 2 else "tracetree.html"

    with open(fn_in, "r", encoding="utf-8") as f:
        data = json.load(f)

    html = build_page(data, fn_out)
    print(f"✓ Wrote {html}")
    webbrowser.open(html.as_uri())
