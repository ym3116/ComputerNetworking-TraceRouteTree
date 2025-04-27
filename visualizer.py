import json
import networkx as nx
import plotly.graph_objects as go

def build_graph(results):
    G = nx.DiGraph()
    for dst, data in results.items():
        prev_node = 'YOU'
        G.add_node(prev_node)
        for hop in data['hops']:
            # pick the most common src among all probes in that TTL
            candidates = [p['src'] for series in hop['series'] for p in series if p['src']]
            node = max(set(candidates), key=candidates.count) if candidates else f"hop{hop['ttl']}"
            G.add_node(node)
            # record avg RTT
            rtts = [p['rtt'] for series in hop['series'] for p in series if p['rtt'] is not None]
            avg = sum(rtts)/len(rtts) if rtts else None
            G.add_edge(prev_node, node, rtt=avg, proto='mixed')
            prev_node = node
        G.nodes[dst]['host'] = data['host']
    return G

def plot_graph(G):
    pos = nx.spring_layout(G)
    edge_x, edge_y, texts = [], [], []
    for u,v,d in G.edges(data=True):
        x0,y0 = pos[u]; x1,y1 = pos[v]
        edge_x += [x0, x1, None]; edge_y += [y0, y1, None]
        texts.append(f"{u}→{v}: {d['rtt']*1000:.1f} ms" if d['rtt'] else f"{u}→{v}")
    edge_trace = go.Scatter(x=edge_x, y=edge_y, mode='lines', hoverinfo='text', text=texts)
    node_x, node_y, labels = [], [], []
    for n in G.nodes():
        x,y = pos[n]
        node_x.append(x); node_y.append(y)
        labels.append(n)
    node_trace = go.Scatter(x=node_x, y=node_y, mode='markers+text', text=labels, textposition='top center')
    fig = go.Figure(data=[edge_trace, node_trace])
    fig.update_layout(title="Traceroute Topology", showlegend=False)
    fig.show()

if __name__=='__main__':
    import sys
    fn = sys.argv[1] if len(sys.argv)>1 else 'raw_results.txt'
    with open(fn) as f:
        data = json.load(f)
    G = build_graph(data)
    plot_graph(G)
