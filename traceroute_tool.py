from scapy.all import IP, ICMP, UDP, TCP, sr1
import argparse
import time
import os
import pandas as pd
from pyvis.network import Network

def parse_args():
    parser = argparse.ArgumentParser(description="Custom traceroute tool with visualization")
    parser.add_argument("ip_file", help="Path to the .txt or .csv file containing IP addresses")
    parser.add_argument("--series", type=int, default=1, help="Number of series per TTL")
    parser.add_argument("--min-ttl", type=int, default=1, help="Minimum TTL value")
    parser.add_argument("--max-ttl", type=int, default=30, help="Maximum TTL value")
    parser.add_argument("--port", type=int, default=33434, help="Port number for UDP/TCP")
    parser.add_argument("--wait", type=float, default=1.0, help="Timeout waiting for reply (in seconds)")
    parser.add_argument("--packet-size", type=int, default=60, help="Packet size in bytes")
    return parser.parse_args()

def send_probe(ip, ttl, proto, port, size, timeout):
    pkt = IP(dst=ip, ttl=ttl)   # create a packet with destination ip and ttl
    if proto == "ICMP":
        pkt /= ICMP()   # add an ICMP layer onto the IP packet
    elif proto == "UDP":
        pkt /= UDP(dport=port) / ("X" * size)
        # add a UDP layer with destination port and payload size    
        # we use "X" * size to simulate the real payload of our UDP packet
        # (otherwise the UDP packet would be so small that it gets treated differently)
    elif proto == "TCP":
        pkt /= TCP(dport=port, flags="S") / ("X" * size)
        # add a TCP layer with destination port, SYN flag, payload size
    else:
        raise ValueError("Unsupported protocol")
    
    start = time.time()
    reply = sr1(pkt, verbose=0, timeout=timeout)    # send the packet and wait for a reply
    # what this reply may look like:
    # <IP  version=4 ihl=5 tos=0x0 len=56 id=0 flags=DF frag=0 ttl=255 proto=ICMP src=1.1.1.1 dst=192.168.1.10 |<ICMP type=3 code=3 |<Raw load='...'>>>
    # so it is the src that we are actually looking for!
    end = time.time()
    rtt = (end - start) * 1000
    return reply, rtt


def traceroute_host(ip, args):
    results = []
    for ttl in range(args.min_ttl, args.max_ttl + 1):
        step_results = []
        for _ in range(args.series):
            for proto in ["UDP", "TCP", "ICMP"]:
                reply, rtt = send_probe(ip, ttl, proto, args.port, args.packet_size, args.wait)
                hop_ip = reply.src if reply else "*"
                step_results.append((ttl, proto, hop_ip, rtt))
        results.append(step_results)
    return results

def save_raw(ip, trace_data):
    with open(f"{ip}_trace.txt", "w") as f:
        for step in trace_data:
            for ttl, proto, hop, rtt in step:
                f.write(f"TTL={ttl}, Proto={proto}, Hop={hop}, RTT={rtt:.2f}ms\n")

def visualize_trace(ip, trace_data):
    net = Network(height='750px', width='100%', directed=True)
    net.add_node("source", label="You")
    last_hop = "source"
    seen = set(["source"])

    for step in trace_data:
        for ttl, proto, hop, rtt in step:
            node_id = f"{ttl}-{proto}-{hop}"
            if hop != "*" and node_id not in seen:
                net.add_node(node_id, label=f"{hop}\n{rtt:.2f}ms", title=proto)
                seen.add(node_id)
            if hop != "*":
                color = {"UDP": "blue", "TCP": "green", "ICMP": "red"}[proto]
                net.add_edge(last_hop, node_id, color=color, title=f"{proto}, {rtt:.2f}ms")
                last_hop = node_id
            else:
                break
    net.show(f"{ip}_trace.html")

def main():
    args = parse_args()

    if args.ip_file.endswith(".csv"):
        ips = pd.read_csv(args.ip_file).iloc[:, 0].dropna().tolist()
    else:
        with open(args.ip_file, "r") as f:
            ips = [line.strip() for line in f if line.strip()]
    
    os.makedirs("results", exist_ok=True)
    os.chdir("results")

    for ip in ips:
        print(f"Running traceroute for {ip}...")
        trace_data = traceroute_host(ip, args)
        save_raw(ip, trace_data)
        visualize_trace(ip, trace_data)
        print(f"Results saved for {ip}")

main()
