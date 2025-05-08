# probe.py  (new version, use threadpooling to speed up traceroutes)

import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from scapy.all import IP, UDP, TCP, ICMP, sr, conf
from ipinfo import getHandler

conf.verb = 0          # silence Scapy

# ----------------------------------------------------------------------
# get geographic location from ip ------------------------------------------------
# ----------------------------------------------------------------------
ipinfo_token = "e284973a5f42ee"
handler = getHandler(ipinfo_token)

def get_geo(ip):
    try:
        details = handler.getDetails(ip)
        loc = details.loc
        if loc:
            lat, lon = map(float, loc.split(","))
            return { "lat": lat, "lon": lon }
    except:
        pass
    return {}

# ----------------------------------------------------------------------
# fast per‑target tracer ------------------------------------------------
# ----------------------------------------------------------------------
def _trace_target(ip, host, *, min_ttl, max_ttl,
                  probes_per_ttl, port, packet_size,
                  timeout, protos=('UDP', 'TCP', 'ICMP')):
    """
    Build one big batch of probes (TTL × proto × probes_per_ttl),
    send them in a single sr() call, collate replies.
    Returns {'host': host, 'hops': [...] }  — identical shape to old code.
    """
    pkts = []
    for ttl in range(min_ttl, max_ttl + 1):
        for proto in protos:
            for _ in range(probes_per_ttl):
                ip_layer = IP(dst=ip, ttl=ttl)
                l4 = UDP(dport=port)   if proto == 'UDP' else \
                     TCP(dport=port, flags='S') if proto == 'TCP' else \
                     ICMP()
                payload = b'X' * max(0, packet_size - len(ip_layer))  # pad
                pkts.append(ip_layer / l4 / payload)

    answered, _ = sr(pkts, timeout=timeout)

    # map (ttl, proto) -> best response (first wins)
    resp_map = {}
    for snd, rcv in answered:
        ttl   = snd.ttl
        proto = 'UDP' if UDP in snd else ('TCP' if TCP in snd else 'ICMP')
        resp_map.setdefault((ttl, proto), {
            'proto': proto,
            'rtt': rcv.time - snd.sent_time,
            'src': rcv.src,
            'code': getattr(rcv, 'code', None)
        })

    hops = []
    for ttl in range(min_ttl, max_ttl + 1):
        series = []
        for proto in protos:
            entry = resp_map.get((ttl, proto), {
            'proto': proto, 'rtt': None, 'src': None, 'code': None
            })
            if entry["src"]:
                entry.update(get_geo(entry["src"]))
            series.append([entry])

        hops.append({'ttl': ttl, 'series': series})
        if any(e['src'] == ip for s in series for e in s):
            break

    return {'host': host or None, 'hops': hops}

# ----------------------------------------------------------------------
# public API ------------------------------------------------------------
# ----------------------------------------------------------------------
def run_traceroutes(targets, hostnames, min_ttl, max_ttl,
                    probes_per_ttl, port, packet_size,
                    wait_time,          # kept for signature compatibility
                    timeout,
                    progress_callback=None):  # NEW
    """
    Launch one traceroute per destination in parallel threads.
    Accepts an optional progress_callback(done, total).
    """
    results = {}
    total = len(targets)
    done = 0

    def wrapped_trace(ip, host):
        nonlocal done
        result = _trace_target(
            ip, host,
            min_ttl=min_ttl, max_ttl=max_ttl,
            probes_per_ttl=probes_per_ttl,
            port=port, packet_size=packet_size,
            timeout=timeout
        )
        done += 1
        if progress_callback:
            progress_callback(done, total)
        return ip, result

    with ThreadPoolExecutor(max_workers=len(targets)) as pool:
        futures = [pool.submit(wrapped_trace, ip, host)
                   for ip, host in zip(targets, hostnames)]
        for future in as_completed(futures):
            try:
                ip, result = future.result()
                results[ip] = result
            except Exception as e:
                ip = targets[futures.index(future)]
                results[ip] = {'host': hostnames[targets.index(ip)], 'hops': [],
                               'error': str(e)}

    return results


# optional stub in case some script still imports it
def single_probe(*_a, **_kw):
    raise NotImplementedError("single_probe was removed in the speed‑up refactor")
