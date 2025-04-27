#!/usr/bin/env python3
import argparse
import pandas as pd
from probe import run_traceroutes
from utils import save_raw_results

def main():
    p = argparse.ArgumentParser(description="Multi-protocol Traceroute")
    p.add_argument('-i','--input', required=True, help='CSV of IP,Hostname')
    p.add_argument('-o','--output', default='raw_results.txt', help='where to dump raw results')
    p.add_argument('--min-ttl', type=int, default=1)
    p.add_argument('--max-ttl', type=int, default=30)
    p.add_argument('--probes', type=int, default=3, help='series per TTL')
    p.add_argument('--port', type=int, default=33434, help='UDP/TCP port')
    p.add_argument('--size', type=int, default=60, help='packet payload size')
    p.add_argument('--wait', type=float, default=1.0, help='seconds between probes')
    p.add_argument('--timeout', type=float, default=2.0, help='sr1 timeout in seconds')
    args = p.parse_args()

    df = pd.read_csv(args.input, comment='#')
    results = run_traceroutes(
        targets=df['IP'].tolist(),
        hostnames=df['Hostname'].tolist(),
        min_ttl=args.min_ttl,
        max_ttl=args.max_ttl,
        probes_per_ttl=args.probes,
        port=args.port,
        packet_size=args.size,
        wait_time=args.wait,
        timeout=args.timeout
    )
    save_raw_results(results, args.output)
    print(f"Raw results saved to {args.output}")

if __name__=='__main__':
    main()
