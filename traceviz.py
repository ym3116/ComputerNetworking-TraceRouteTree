#!/usr/bin/env python3
"""
This file is to optimize user workflow. we just need to run this file
example use:
python traceviz.py run sample_ips.csv --min-ttl 1 --max-ttl 20 --probes 1

traceviz.py - run multi-protocol traceroutes *and* visualise them.

Commands:
  run  targets.csv [options]     # trace & open UI
  view raw.json                  # just open existing results

Typical use:
  python traceviz.py run targets.csv --min-ttl 1 --max-ttl 20 --probes 5
"""

import argparse, sys, webbrowser, pandas as pd
from probe import run_traceroutes, single_probe               # ← our existing logic
from parser import save_aggregated
from interactive_viz import build_graph, visualise

def cmd_run(args):
    df = pd.read_csv(args.targets)
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
    html = visualise(build_graph(raw))
    print("✓ done - opening", html)
    webbrowser.open(html.as_uri())

def cmd_view(args):
    import json, pathlib
    with open(args.raw) as f:
        raw = json.load(f)
    html = visualise(build_graph(raw))
    print("Opening", html)
    webbrowser.open(html.as_uri())

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
