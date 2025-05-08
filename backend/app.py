# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import os
# import tempfile
# import pandas as pd
# from pathlib import Path

# from core.probe import run_traceroutes
# from core.parser import aggregate_results

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# # from core.traceviz import run_traceroute, progress_status


# import csv
# import io
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import threading

# progress_data = {"percentage": 0}
# lock = threading.Lock()



# app = Flask(__name__)
# CORS(app)  # allow requests from your React frontend

# @app.route("/api/trace", methods=["POST"])
# def api_trace():
#     f = request.files.get("file")
#     if not f:
#         return jsonify({"error": "missing file"}), 400

#     min_ttl = int(request.form.get("min_ttl", 1))
#     max_ttl = int(request.form.get("max_ttl", 20))
#     probes  = int(request.form.get("probes", 3))

#     tmp = Path(tempfile.gettempdir()) / f.filename
#     f.save(tmp)

#     ext = tmp.suffix.lower()
#     if ext == ".csv":
#         df = pd.read_csv(tmp)
#     elif ext == ".txt":
#         lines = [line.strip() for line in tmp.read_text().splitlines() if line.strip()]
#         df = pd.DataFrame({"IP": lines, "Hostname": [""] * len(lines)})
#     else:
#         return jsonify({"error": "Unsupported file type"}), 400
    
#     print("arrive after file")

#     targets   = df["IP"].tolist()
#     hostnames = df.get("Hostname", pd.Series([""] * len(df))).tolist()

#     print(targets)
#     print(hostnames)

#     raw = run_traceroutes(
#         targets, hostnames,
#         min_ttl=min_ttl, max_ttl=max_ttl,
#         probes_per_ttl=probes, port=33434,
#         packet_size=60, wait_time=1.0, timeout=2.0,
#     )

#     print("arrive after runtrace")

#     results = aggregate_results(raw)

#     print(raw)
#     print()
#     print(results)
#     return jsonify(results)

# @app.route("/api/visulize", methods=["POST"])
# def api_visulize():
#     return








# if __name__ == "__main__":
#     app.run(debug=True)


from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
import pandas as pd
from pathlib import Path
import threading

from core.probe import run_traceroutes
from core.parser import aggregate_results

app = Flask(__name__)
CORS(app)

# Global progress tracking
progress_data = {"percentage": 0}
lock = threading.Lock()


@app.route("/api/trace", methods=["POST"])
def api_trace():
    f = request.files.get("file")
    if not f:
        return jsonify({"error": "missing file"}), 400

    min_ttl = int(request.form.get("min_ttl", 1))
    max_ttl = int(request.form.get("max_ttl", 20))
    probes = int(request.form.get("probes", 3))

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

    targets = df["IP"].tolist()
    hostnames = df.get("Hostname", pd.Series([""] * len(df))).tolist()

    # Reset progress
    with lock:
        progress_data["percentage"] = 0

    def update_progress(done, total):
        with lock:
            progress_data["percentage"] = int((done / total) * 100)

    raw = run_traceroutes(
        targets, hostnames,
        min_ttl=min_ttl,
        max_ttl=max_ttl,
        probes_per_ttl=probes,
        port=33434,
        packet_size=60,
        wait_time=1.0,
        timeout=2.0,
        progress_callback=update_progress
    )

    results = aggregate_results(raw)

    # Ensure full progress bar before returning
    with lock:
        progress_data["percentage"] = 100

    return jsonify(results)


@app.route("/api/progress")
def get_progress():
    with lock:
        return jsonify(progress_data)


@app.route("/api/visulize", methods=["POST"])
def api_visulize():
    return jsonify({"message": "Visualization endpoint placeholder"})


if __name__ == "__main__":
    app.run(debug=True)

