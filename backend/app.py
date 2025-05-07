from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
import pandas as pd
from pathlib import Path

from core.probe import run_traceroutes
from core.parser import aggregate_results

app = Flask(__name__)
CORS(app)  # allow requests from your React frontend

@app.route("/api/trace", methods=["POST"])
def api_trace():
    f = request.files.get("file")
    if not f:
        return jsonify({"error": "missing file"}), 400

    min_ttl = int(request.form.get("min_ttl", 1))
    max_ttl = int(request.form.get("max_ttl", 20))
    probes  = int(request.form.get("probes", 3))

    tmp = Path(tempfile.gettempdir()) / f.filename
    f.save(tmp)

    ext = tmp.suffix.lower()
    if ext == ".csv":
        df = pd.read_csv(tmp)
    elif ext == ".txt":
        lines = [line.strip() for line in tmp.read_text().splitlines() if line.strip()]
        df = pd.DataFrame({"IP": lines, "Hostname": [""] * len(lines)})
    else:
        return jsonify({"error": "Unsupported file type"}), 400

    targets   = df["IP"].tolist()
    hostnames = df.get("Hostname", pd.Series([""] * len(df))).tolist()

    raw = run_traceroutes(
        targets, hostnames,
        min_ttl=min_ttl, max_ttl=max_ttl,
        probes_per_ttl=probes, port=33434,
        packet_size=60, wait_time=1.0, timeout=2.0,
    )

    results = aggregate_results(raw)
    return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True)
