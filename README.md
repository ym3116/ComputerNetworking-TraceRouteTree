# ComputerNetworking-TraceRouteTree

**ComputerNetworking-TraceRouteTree** is a standalone Python-based traceroute implementation and interactive network topology visualizer. It performs per-hop network measurements using UDP, TCP, and ICMP protocols, and generates a force-directed tree annotated with round-trip time (RTT), throughput, and protocol information.

## ✨ Features

- Lightweight and fully Python-based (no root required)
- Supports UDP, TCP, and ICMP probes
- Visualizes traceroute paths as an interactive force-directed graph
- Annotates each hop with RTT and protocol metadata
- Saves raw probe data for further analysis

## 🛠️ Usage

1. Add the IPs you want to trace in `sample_ips.csv`.  
   You can copy example IPs from `many_sample_ips.csv`.

2. Run the traceroute and generate the visualization by executing:

   ```bash
   python traceviz.py run sample_ips.csv --min-ttl 1 --max-ttl 20 --probes 1
