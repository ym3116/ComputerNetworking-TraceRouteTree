import json
import networkx as nx
import plotly.graph_objects as go

def build_graph(results, proto_name):
    G = nx.DiGraph()
    for dst, data in results.items():
        prev_node = f'YOU-{proto_name}'
        G.add_node(prev_node)

        last_valid_node = None

        for hop in data['hops']:
            # 只选当前协议下的 src
            candidates = [p['src'] for series in hop['series'] for p in series if p['src'] and p['proto'] == proto_name]
            node = max(set(candidates), key=candidates.count) if candidates else None

            if node:
                G.add_node(node)

                # 选当前协议的RTT
                rtts = [p['rtt'] for series in hop['series'] for p in series if p['rtt'] is not None and p['proto'] == proto_name]
                avg = sum(rtts) / len(rtts) if rtts else None

                G.add_edge(prev_node, node, rtt=avg, proto=proto_name)
                prev_node = node
                last_valid_node = node

        # 最后连到目标IP
        if last_valid_node:
            G.add_node(dst)
            G.add_edge(last_valid_node, dst, rtt=None, proto=proto_name)
            G.nodes[dst]['host'] = data['host']

    return G

def plot_graph(G, proto_name):
    pos = nx.spring_layout(G, seed=42)  # 保持布局一致
    edge_x, edge_y, texts = [], [], []
    color_map = {'UDP': 'blue', 'TCP': 'green', 'ICMP': 'red'}
    color = color_map.get(proto_name, 'black')

    for u, v, d in G.edges(data=True):
        x0, y0 = pos[u]; x1, y1 = pos[v]
        edge_x += [x0, x1, None]
        edge_y += [y0, y1, None]
        label = f"{u}→{v}: {d['rtt']*1000:.1f} ms" if d['rtt'] else f"{u}→{v}"
        texts.append(label)

    edge_trace = go.Scatter(x=edge_x, y=edge_y, mode='lines', line=dict(color=color), hoverinfo='text', text=texts)

    node_x, node_y, labels = [], [], []
    for n in G.nodes():
        x, y = pos[n]
        node_x.append(x)
        node_y.append(y)
        host_info = G.nodes[n].get('host', '')
        if host_info:
            labels.append(f"{n}\n({host_info})")
        else:
            labels.append(n)

    node_trace = go.Scatter(x=node_x, y=node_y, mode='markers+text', text=labels, textposition='top center')

    fig = go.Figure(data=[edge_trace, node_trace])

    fig.update_layout(
        title=f"Traceroute Topology - {proto_name} Path",
        showlegend=False
    )
    fig.show()

if __name__ == '__main__':
    import sys
    fn = sys.argv[1] if len(sys.argv) > 1 else 'raw_results.txt'
    with open(fn) as f:
        data = json.load(f)

    for proto in ['UDP', 'TCP', 'ICMP']:
        print(f"Drawing {proto} path...")
        G = build_graph(data, proto)
        plot_graph(G, proto)
