# probe.py  (new version, use threadpooling to speed up traceroutes)

import time
from scapy.all import IP, UDP, TCP, ICMP, sr
from collections import defaultdict
#from .utils import generate_current_od_calls
import ipinfo

# ⬇️ Geolocation support via ipinfo.io
ipinfo_token = "your_ipinfo_token_here"  # ← replace with your token
ipinfo_handler = ipinfo.getHandler(ipinfo_token)

# ⬇️ Returns {"lat": ..., "lon": ...} if available, else {}
def get_geo(ip):
    try:
        details = ipinfo_handler.getDetails(ip)
        loc = details.loc
        if loc:
            lat, lon = map(float, loc.split(','))
            return { "lat": lat, "lon": lon }
    except:
        pass
    return {}

# ⬇️ Build a probe packet with given TTL, protocol, port, size
def _build_probe(ip, ttl, proto, port, size):
    pkt = IP(dst=ip, ttl=ttl)
    if proto == "UDP":
        pkt /= UDP(dport=port)/("X" * size)
    elif proto == "TCP":
        pkt /= TCP(dport=port)/("X" * size)
    elif proto == "ICMP":
        pkt /= ICMP()/("X" * size)
    return pkt

# ⬇️ Sends probes to a target IP for all TTLs and protocols
def _trace_target(
    ip, min_ttl=1, max_ttl=20, probes=1, port=80, size=60, timeout=1
):
    hops = []
    for ttl in range(min_ttl, max_ttl+1):
        series = []
        # ⬇️ Send multiple series of probes
        for _ in range(probes):
            batch = []
            for proto in ("UDP", "TCP", "ICMP"):
                pkt = _build_probe(ip, ttl, proto, port, size)
                batch.append(pkt)

            # ⬇️ Send batch and collect responses
            answered, _ = sr(batch, timeout=timeout, verbose=False)

            # ⬇️ Build a map of (ttl, proto) → reply data
            resp_map = {}
            for snd, rcv in answered:
                proto = snd.payload.name
                rtt = rcv.time - snd.sent_time
                resp_map[(ttl, proto)] = {
                    "proto": proto,
                    "rtt": rtt,
                    "src": rcv.src,
                    "code": rcv.getlayer(1).type if proto == "ICMP" else rcv.getlayer(1).flags
                }

            # ✅ for map visualization: Add geolocation info to each probe result
            for proto in ("UDP", "TCP", "ICMP"):
                entry = resp_map.get((ttl, proto), {
                    "proto": proto,
                    "rtt": None,
                    "src": None,
                    "code": None
                })
                if entry["src"]:
                    entry.update(get_geo(entry["src"]))  # ⬅️ adds "lat" and "lon"
                series.append([entry])  # ⬅️ keep grouped by protocol

        # ⬇️ Save full set of responses per TTL
        hops.append({
            "ttl": ttl,
            "series": series
        })

    return hops

# ⬇️ Wrapper: handles multiple targets
def run_traceroutes(targets, min_ttl=1, max_ttl=20, probes=1, port=80, size=60, timeout=1):
    results = {}
    for ip, host in targets:
        hops = _trace_target(ip, min_ttl, max_ttl, probes, port, size, timeout)
        results[ip] = {
            "host": host,
            "hops": hops
        }
    return results
