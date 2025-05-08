#!/usr/bin/env python3
"""
This is the main backend file that fetch input data from landing page and calls traceroute function(probe and parser)
example using:

python traceviz.py run sample_ips.csv --min-ttl 1 --max-ttl 20 --probes 1

traceviz.py - run multi-protocol traceroutes *and* visualise them.

Commands:
  run  targets.csv [options]     # trace & open UI
  view raw.json                  # just open existing results

Typical use:
  python traceviz.py run targets.csv --min-ttl 1 --max-ttl 20 --probes 5
"""

import argparse, sys, webbrowser, pandas as pd
import os
from core.probe import run_traceroutes               # probe,traceroute.py
from core.parser import save_aggregated            # parser.py
from core.interactive_viz import build_page # interactive_viz.py
# core/traceviz.py

# progress_status = {"progress": 0}

# def run_traceroute(targets):
#     import time
#     results = []
#     total = len(targets)
#     if total == 0:
#         progress_status["progress"] = 100
#         return results

#     for i, target in enumerate(targets):
#         # Simulate traceroute logic
#         time.sleep(1)
#         results.append({"target": target, "status": "done"})
#         progress_status["progress"] = int((i + 1) / total * 100)

#     return results




def cmd_run(args):
    ext = os.path.splitext(args.targets)[-1].lower()
    if ext == ".csv":
        df = pd.read_csv(args.targets)
    elif ext == ".txt":
        with open(args.targets, "r") as f:
            lines = [line.strip() for line in f if line.strip()]
        df = pd.DataFrame({"IP": lines, "Hostname": [""] * len(lines)})
    else:
        raise ValueError("Unsupported file format: use .csv or .txt")

    print(f"↻ Tracing {len(df)} destinations …")
    raw = run_traceroutes(
        targets   = df['IP'].tolist(),
        hostnames = df.get('Hostname', pd.Series(['']) ).tolist(),
        min_ttl   = args.min_ttl,  max_ttl = args.max_ttl,
        probes_per_ttl = args.probes, port = args.port,
        packet_size = args.size, wait_time = args.wait,
        timeout = args.timeout
    )
    save_aggregated(raw, args.out)
    html = build_page(raw)
    print("✓ done - opening", html)
    webbrowser.open(html.as_uri())

def cmd_view(args):
    import json, pathlib
    with open(args.raw) as f:
        raw = json.load(f)
    html = build_page(raw)
    print("Opening", html)
    webbrowser.open(html.as_uri())



# Try to track the progress dynamically:
import time
# Shared progress state





def main():
    
    p = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    p_run = sub.add_parser("run")
    p_run.add_argument("targets", help="CSV with columns IP, Hostname")
    p_run.add_argument("--out", default="raw_results.json", help="where to save raw+aggregated JSON")

    # the traceroute knobs (mirrors our old CLI)
    p_run.add_argument("--min-ttl", type=int, default=1)
    p_run.add_argument("--max-ttl", type=int, default=30)
    p_run.add_argument("--probes", type=int, default=3)
    p_run.add_argument("--port", type=int, default=33434)
    p_run.add_argument("--size", type=int, default=60)
    p_run.add_argument("--wait", type=float, default=1.0)
    p_run.add_argument("--timeout", type=float, default=2.0)
    p_run.set_defaults(func=cmd_run)

    p_view = sub.add_parser("view")
    p_view.add_argument("raw", help="existing raw_results.json")
    p_view.set_defaults(func=cmd_view)

    args = p.parse_args()
    args.func(args)







if __name__ == "__main__":
    
    main()
