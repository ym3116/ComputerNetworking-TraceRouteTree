#!/usr/bin/env python3
import time
from typing import Optional, Tuple
from scapy.all import IP, UDP, TCP, ICMP, sr1, conf

# Silence Scapy’s default verbose output
conf.verb = 0

def send_probe(
    dst: str,
    ttl: int,
    proto: str,
    port: int,
    pkt_size: int,
    timeout: float
) -> Tuple[Optional[str], float]:
    """
    Send a single probe packet to `dst` with the given `ttl` and `proto`.

    Args:
        dst (str):       Destination IP address (e.g. "8.8.8.8")
        ttl (int):       Time‐to‐Live value to set in the IP header
        proto (str):     One of "UDP", "TCP", or "ICMP"
        port (int):      Destination port (for UDP or TCP probes)
        pkt_size (int):  Total packet size in bytes (incl. IP header)
        timeout (float): How many seconds to wait for a reply

    Returns:
        responder_ip (str or None):  IP address of the first reply packet, or None if timed out
        rtt_ms (float):              Round‐trip time in milliseconds
    """
    # 1) Build the IP layer with the specified TTL
    ip_layer = IP(dst=dst, ttl=ttl)

    # 2) Attach the transport layer + payload padding to reach pkt_size
    if proto.upper() == 'UDP':
        # UDP header is 8 bytes; IP header is typically 20 bytes
        payload = b'X' * (pkt_size - 28)
        packet = ip_layer / UDP(dport=port) / payload

    elif proto.upper() == 'TCP':
        # TCP SYN flag; TCP header is ~20 bytes
        payload = b'X' * (pkt_size - 40)
        packet = ip_layer / TCP(dport=port, flags='S') / payload

    elif proto.upper() == 'ICMP':
        # ICMP echo request; header is 8 bytes
        payload = b'X' * (pkt_size - 28)
        packet = ip_layer / ICMP() / payload

    else:
        raise ValueError(f"Unsupported protocol: {proto!r}")

    # 3) Timestamp just before sending
    start_time = time.time()

    # 4) Send the packet and wait for a single response (sr1 = send & receive one)
    #    Returns None if no packet is received within `timeout`
    response = sr1(packet, timeout=timeout)

    # 5) Compute RTT in milliseconds
    rtt_ms = (time.time() - start_time) * 1000

    # 6) Extract responder IP if we got a reply
    responder_ip = response.src if response is not None else None

    return responder_ip, rtt_ms


# Example usage:
if __name__ == "__main__":
    dst_ip = "8.8.8.8"
    ttl_value = 1
    protocol = "ICMP"
    resp, rtt = send_probe(dst_ip, ttl_value, protocol, port=33434, pkt_size=60, timeout=1.0)
    if resp:
        print(f"Hop {ttl_value}: got reply from {resp} in {rtt:.2f} ms")
    else:
        print(f"Hop {ttl_value}: no reply within timeout")
