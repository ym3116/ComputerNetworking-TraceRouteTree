# #!/usr/bin/env python3
# import time
# from concurrent.futures import ThreadPoolExecutor, as_completed
# from scapy.all import IP, UDP, TCP, ICMP, sr, conf

# # Silence Scapy’s verbose output
# conf.verb = 0

# def trace_target(
#     ip,
#     host=None,
#     min_ttl=1,
#     max_ttl=30,
#     probes_per_ttl=3,
#     port=33434,
#     packet_size=60,
#     protos=('UDP', 'TCP', 'ICMP'),
#     timeout=2
# ):
#     """
#     Build and send one big batch of packets for a single IP (all TTLs x all protocols x probes_per_ttl),
#     wait once (timeout), then collate replies by TTL & protocol.
#     Returns (ip, host, hops_list, elapsed_seconds).
#     """
#     start = time.time()

#     # Prepare all probes at once
#     pkts = []
#     for ttl in range(min_ttl, max_ttl + 1):
#         for proto in protos:
#             for _ in range(probes_per_ttl):
#                 ip_layer = IP(dst=ip, ttl=ttl)
#                 if proto == 'UDP':
#                     layer = UDP(dport=port)
#                 elif proto == 'TCP':
#                     layer = TCP(dport=port, flags='S')
#                 else:
#                     layer = ICMP()
#                 payload = b'X' * (packet_size - len(ip_layer))
#                 pkts.append(ip_layer / layer / payload)

#     # Send them all at once; wait up to `timeout` seconds
#     answered, _ = sr(pkts, timeout=timeout)

#     # Organize responses by TTL & protocol
#     hops = {}
#     for snd, rcv in answered:
#         ttl = snd.ttl
#         proto = 'UDP' if UDP in snd else ('TCP' if TCP in snd else 'ICMP')
#         entry = {
#             'rtt': rcv.time - snd.sent_time,
#             'src': rcv.src,
#             'code': getattr(rcv, 'code', None)
#         }
#         hops.setdefault(ttl, {}).setdefault(proto, []).append(entry)

#     # Build ordered hop list until we reach the target
#     hops_list = []
#     for ttl in range(min_ttl, max_ttl + 1):
#         series = [hops.get(ttl, {}).get(p, []) for p in protos]
#         hops_list.append({'ttl': ttl, 'series': series})
#         if any(r['src'] == ip for proto_list in series for r in proto_list):
#             break

#     elapsed = time.time() - start
#     return ip, host, hops_list, elapsed

# if __name__ == '__main__':
#     # Replace these with your destinations
#     targets   = ['6.6.6.6','8.8.8.8', '1.1.1.1', '9.9.9.9']
#     hostnames = [None] * len(targets)

#     # Launch one traceroute per target, all in parallel
#     with ThreadPoolExecutor(max_workers=len(targets)) as executor:
#         futures = {
#             executor.submit(
#                 trace_target, ip, host,
#                 min_ttl=1, max_ttl=30,
#                 probes_per_ttl=3,
#                 port=33434,
#                 packet_size=60,
#                 protos=('UDP','TCP','ICMP'),
#                 timeout=2
#             ): ip
#             for ip, host in zip(targets, hostnames)
#         }

#         for fut in as_completed(futures):
#             ip, host, hops, elapsed = fut.result()
#             print(f"\nTrace to {ip} ({host}) completed in {elapsed:.2f}s")
#             for hop in hops:
#                 line = f" TTL={hop['ttl']:2d}: "
#                 for proto_res in hop['series']:
#                     for p in proto_res:
#                         src = p['src'] or '*'
#                         rtt = f"{p['rtt']:.3f}s" if p['rtt'] is not None else 'timeout'
#                         line += f"{src}({rtt}) "
#                 print(line)














# #!/usr/bin/env python3
# import time
# from concurrent.futures import ThreadPoolExecutor, as_completed
# from scapy.all import IP, UDP, TCP, ICMP, sr, conf

# # Silence Scapy’s verbose output
# conf.verb = 0

# def trace_target(
#     ip,
#     host=None,
#     min_ttl=1,
#     max_ttl=30,
#     probes_per_ttl=3,
#     port=33434,
#     packet_size=60,
#     protos=('UDP', 'TCP', 'ICMP'),
#     timeout=2
# ):
#     """
#     Build and send a batch of packets for a single IP (all TTLs × all protocols × probes_per_ttl),
#     wait once (timeout), then collate replies by TTL & protocol.
#     Returns (ip, host, hops_list, elapsed_seconds).
#     """
#     start = time.time()

#     # Prepare all probes at once
#     pkts = []
#     for ttl in range(min_ttl, max_ttl + 1):
#         for proto in protos:
#             for _ in range(probes_per_ttl):
#                 ip_layer = IP(dst=ip, ttl=ttl)
#                 if proto == 'UDP':
#                     layer = UDP(dport=port)
#                 elif proto == 'TCP':
#                     layer = TCP(dport=port, flags='S')
#                 else:
#                     layer = ICMP()
#                 payload = b'X' * (packet_size - len(ip_layer))
#                 pkts.append(ip_layer / layer / payload)

#     # Send them all at once; wait up to `timeout` seconds
#     answered, _ = sr(pkts, timeout=timeout)

#     # Organize responses by TTL & protocol
#     hops = {}
#     for snd, rcv in answered:
#         ttl = snd.ttl
#         proto = 'UDP' if UDP in snd else ('TCP' if TCP in snd else 'ICMP')
#         entry = {
#             'rtt': rcv.time - snd.sent_time,
#             'src': rcv.src,
#             'code': getattr(rcv, 'code', None)
#         }
#         hops.setdefault(ttl, {}).setdefault(proto, []).append(entry)

#     # Build ordered hop list until we reach the target
#     hops_list = []
#     for ttl in range(min_ttl, max_ttl + 1):
#         series = [hops.get(ttl, {}).get(p, []) for p in protos]
#         hops_list.append({'ttl': ttl, 'series': series})
#         # Stop if any response shows we've hit the destination
#         if any(r['src'] == ip for proto_list in series for r in proto_list):
#             break

#     elapsed = time.time() - start
#     return ip, host, hops_list, elapsed

# if __name__ == '__main__':
#     # Replace these with your actual destinations
#     targets   = ['8.8.8.8', '1.1.1.1', '6.6.6.6', '9.9.9.9']
#     hostnames = [None] * len(targets)

#     # Launch traceroutes in parallel
#     results = []
#     with ThreadPoolExecutor(max_workers=len(targets)) as executor:
#         futures = {
#             executor.submit(
#                 trace_target, ip, host,
#                 min_ttl=1, max_ttl=30,
#                 probes_per_ttl=3,
#                 port=33434,
#                 packet_size=60,
#                 protos=('UDP','TCP','ICMP'),
#                 timeout=2
#             ): ip
#             for ip, host in zip(targets, hostnames)
#         }
#         for fut in as_completed(futures):
#             results.append(fut.result())

#     # Pretty‐print with one line per hop (grouped & averaged)
#     for ip, host, hops, elapsed in results:
#         print(f"\nTrace to {ip} completed in {elapsed:.2f}s")
#         for hop in hops:
#             ttl = hop['ttl']
#             # Gather all replies by src
#             stats = {}
#             for proto_res in hop['series']:
#                 for p in proto_res:
#                     src = p['src'] or '*'
#                     stats.setdefault(src, []).append(p['rtt'])
#             if not stats:
#                 break  # stop at first entirely silent TTL
#             # Build display parts
#             parts = []
#             for src, rtts in stats.items():
#                 avg = sum(rtts) / len(rtts)
#                 parts.append(f"{src} x{len(rtts)} avg={avg:.3f}s")
#             print(f" TTL={ttl:2d}: " + " | ".join(parts))











#!/usr/bin/env python3
import csv
import json
import time
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from scapy.all import IP, UDP, TCP, ICMP, sr, conf

# Silence Scapy’s verbose output
conf.verb = 0

def trace_target(
    ip,
    host=None,
    min_ttl=1,
    max_ttl=30,
    protos=('UDP', 'TCP', 'ICMP'),
    probes_per_ttl=1,
    port=33434,
    packet_size=60,
    timeout=2
):
    """
    Send one probe per (TTL × proto) in a single sr() call,
    then build a hop-by-hop list with nulls for timeouts.
    """
    # build packets
    pkts = []
    for ttl in range(min_ttl, max_ttl + 1):
        for proto in protos:
            for _ in range(probes_per_ttl):
                ip_layer = IP(dst=ip, ttl=ttl)
                if proto == 'UDP':
                    layer = UDP(dport=port)
                elif proto == 'TCP':
                    layer = TCP(dport=port, flags='S')
                else:  # ICMP
                    layer = ICMP()
                payload = b'X' * (packet_size - len(ip_layer))
                pkts.append(ip_layer / layer / payload)

    # fire them all at once
    answered, _ = sr(pkts, timeout=timeout)

    # map (ttl, proto) -> response
    resp_map = {}
    for snd, rcv in answered:
        ttl = snd.ttl
        if UDP in snd:
            proto = 'UDP'
        elif TCP in snd:
            proto = 'TCP'
        else:
            proto = 'ICMP'
        resp_map[(ttl, proto)] = {
            'proto': proto,
            'rtt': rcv.time - snd.sent_time,
            'src': rcv.src,
            'code': getattr(rcv, 'code', None)
        }

    # build the hops list
    hops = []
    for ttl in range(min_ttl, max_ttl + 1):
        series = []
        for proto in protos:
            entry = resp_map.get((ttl, proto), {
                'proto': proto,
                'rtt': None,
                'src': None,
                'code': None
            })
            series.append([entry])
        hops.append({'ttl': ttl, 'series': series})

        # stop when we see the destination
        if any(entry['src'] == ip for proto_list in series for entry in proto_list):
            break

    return {'host': host, 'hops': hops}


def main():
    parser = argparse.ArgumentParser(
        description="Traceroute multiple hosts from a CSV, output JSON"
    )
    parser.add_argument('input_csv', help="CSV with columns IP,Hostname")
    parser.add_argument('output_json', help="where to write the JSON results")
    args = parser.parse_args()

    # load targets
    targets = []
    with open(args.input_csv, newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            ip = row['IP'].strip()
            host = row.get('Hostname', '').strip() or None
            targets.append((ip, host))

    # run in parallel, one thread per target
    results = {}
    with ThreadPoolExecutor(max_workers=len(targets)) as pool:
        futures = {
            pool.submit(trace_target, ip, host): ip
            for ip, host in targets
        }
        for fut in as_completed(futures):
            ip = futures[fut]
            results[ip] = fut.result()

    # write JSON
    with open(args.output_json, 'w') as out:
        json.dump(results, out, indent=2)

    print(f"Wrote results for {len(results)} targets to {args.output_json}")

if __name__ == '__main__':
    main()
