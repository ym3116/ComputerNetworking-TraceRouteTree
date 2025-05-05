"""
THIS IS A HELPER FILE
parser.py - convenience helpers used by both tracer and visualiser
Keeps all the result-aggregation logic in one place.
"""
import statistics, json

def aggregate_results(raw):
    """
    Takes the raw dict saved by utils.save_raw_results()
    Adds avg RTT / loss for every (src,dst,proto) pair.
    """
    out = {}
    for dst, data in raw.items():
        hops_out = []
        for hop in data["hops"]:
            metrics = {}
            for series in hop["series"]:
                for p in series:
                    proto = p["proto"]
                    m = metrics.setdefault(proto, {"sent": 0, "rtt": []})
                    m["sent"] += 1
                    if p["rtt"] is not None:
                        m["rtt"].append(p["rtt"])
            # summarise
            hop_sum = {}
            for proto, m in metrics.items():
                recv = len(m["rtt"])
                hop_sum[proto] = {
                    "sent": m["sent"],
                    "recv": recv,
                    "loss": 1 - recv / m["sent"],
                    "avg_rtt": statistics.mean(m["rtt"]) if recv else None
                }
            hops_out.append({"ttl": hop["ttl"], "metrics": hop_sum, "series": hop["series"]})
        out[dst] = {**data, "hops": hops_out}
    return out

def save_aggregated(raw, filename="raw_results.json"):
    with open(filename, "w") as f:
        json.dump(aggregate_results(raw), f, indent=2)
