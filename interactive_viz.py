#!/usr/bin/env python3
"""
interactive_viz.py - build an interactive HTML path-tree from raw traceroute JSON
Usage: python interactive_viz.py raw.json [outfile.html]
"""
import json, statistics
from pathlib import Path
import networkx as nx
from pyvis.network import Network

PROTO_COLOR = {"UDP": "#1f77b4", "TCP": "#2ca02c", "ICMP": "#ff7f0e"}

def _aggregate_link(series):
    """series = list[probe_dict] (exactly the 3 packets we sent at this hop)"""
    by_proto = {}
    for p in series:
        pkt_ok = p.get("rtt") is not None
        d = by_proto.setdefault(p["proto"], {"sent": 0, "recv": 0, "rtts": []})
        d["sent"] += 1
        if pkt_ok:
            d["recv"] += 1
            d["rtts"].append(p["rtt"])
    out = {}
    for proto, stats in by_proto.items():
        loss = 1 - stats["recv"] / stats["sent"]
        rtt = statistics.mean(stats["rtts"]) if stats["rtts"] else None
        out[proto] = {"rtt": rtt, "loss": loss}
    return out

def build_graph(results):
    """results = raw JSON from utils.save_raw_results()"""
    G = nx.DiGraph()
    for dest, data in results.items():
        prev = "SRC"           # root for every path
        G.add_node(prev, label="YOU")
        for hop in data["hops"]:
            # choose *one* IP to represent this hop (the most frequent answer)
            answers = [p["src"] for s in hop["series"] for p in s if p["src"]]
            node = max(set(answers), key=answers.count) if answers else f"*{hop['ttl']}*"
            G.add_node(node, label=node)
            agg = _aggregate_link(hop["series"])
            for proto, m in agg.items():
                G.add_edge(prev, node,
                           proto=proto,
                           rtt=m["rtt"],
                           loss=m["loss"])
            prev = node
        G.nodes[dest]["label"] = f"{dest}\n({data.get('host','')})"
    return G

def visualise(G, outfile="tracetree.html"):
    net = Network(height="800px", width="100%", directed=True, bgcolor="#ffffff")
    net.barnes_hut()      # smooth physics but reproducible
    for n, attrs in G.nodes(data=True):
        net.add_node(n, label=attrs.get("label", n), title=attrs.get("label", n))
    for u, v, d in G.edges(data=True):
        color = PROTO_COLOR[d["proto"]]
        length = max(100, min(700, int((d["rtt"] or 0.1)*800)))  # px
        width  = max(1, int((1 - d["loss"]) * 6))               # 1–6 px
        title  = f"{d['proto']} {u}→{v}<br>avg RTT: {d['rtt']*1000 if d['rtt'] else '-'} ms<br>loss: {d['loss']*100:.0f}%"
        net.add_edge(u, v, color=color, width=width, length=length, title=title)
    net.show(outfile)
    return Path(outfile).resolve()

if __name__ == "__main__":
    import sys, webbrowser
    fn_in  = sys.argv[1] if len(sys.argv) > 1 else "raw_results.json"
    fn_out = sys.argv[2] if len(sys.argv) > 2 else "tracetree.html"
    with open(fn_in) as f:
        js = json.load(f)
    html = visualise(build_graph(js), fn_out)
    print("Wrote", html)
    webbrowser.open(html.as_uri())
