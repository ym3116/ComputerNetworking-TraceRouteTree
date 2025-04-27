import time
from scapy.all import IP, UDP, TCP, ICMP, sr1, conf
from rich.progress import track

conf.verb = 0  # silence Scapy

def single_probe(dst, ttl, port, size, proto, timeout):
    ip = IP(dst=dst, ttl=ttl)
    payload = b'X' * (size - len(ip))  # adjust so total ≈ `size`
    if proto == 'UDP':
        pkt = ip/UDP(dport=port)/payload
    elif proto == 'TCP':
        pkt = ip/TCP(dport=port, flags='S')/payload
    else:  # ICMP
        pkt = ip/ICMP()/payload

    start = time.time()
    resp = sr1(pkt, timeout=timeout)
    end = time.time()

    return {
        'proto': proto,
        'rtt': (end - start) if resp else None,
        'src': resp.src if resp else None,
        'code': getattr(resp, 'code', None)
    }

def run_traceroutes(targets, hostnames, min_ttl, max_ttl,
                    probes_per_ttl, port, packet_size, wait_time, timeout):
    all_results = {}
    for ip, host in zip(targets, hostnames):
        hops = []
        for ttl in track(range(min_ttl, max_ttl+1), description=f"Tracing {ip}"):
            series = []
            for proto in ('UDP','TCP','ICMP'):
                proto_resps = []
                for _ in range(probes_per_ttl):
                    probe_result = single_probe(
                        dst=ip,
                        ttl=ttl,
                        port=port,
                        size=packet_size,
                        proto=proto,
                        timeout=timeout
                    )
                    proto_resps.append(probe_result)
                    time.sleep(wait_time)
                series.append(proto_resps)
            hops.append({'ttl': ttl, 'series': series})

            # stop if we’ve reached the target IP
            last_srcs = [p['src'] for proto in series for p in proto if p['src']]
            if ip in last_srcs:
                break

        all_results[ip] = {'host': host or None, 'hops': hops}
    return all_results
