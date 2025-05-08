# 🌍 ComputerNetworking-TraceViz

**TraceViz** is an interactive traceroute visualizer that maps packet paths across the internet using ICMP, TCP, and UDP protocols. It allows you to upload a list of destination IPs, run traceroutes, view each hop on an interactive world map, and download the results in multiple formats (CSV, TXT, JSON, PDF).

---

## 🚀 Features

- Upload `.csv` or `.txt` files of destination IPs
- Run multi-protocol traceroute (ICMP, TCP, UDP)
- Interactive Leaflet map with hop geolocation
- Expandable destination list with detailed hop info
- Download results as JSON, TXT, CSV, or PDF

---

## 🧩 Tech Stack

- **Frontend**: React, React Bootstrap, Leaflet, jsPDF, FileSaver.js
- **Backend**: Python, Flask, Scapy, ipinfo
- **Geolocation**: IP info lookups via `ipinfo.io`

---

## 📦 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/ym3116/ComputerNetworking-TraceViz
cd ComputerNetworking-TraceViz
```

### 2. Set Up and Start the Backend (Python + Flask)

Please make sure that your computer have installed Node js and Python.

run the following code in your terminal:
```bash
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies and start the backend
cd backend
pip install -r requirements.txt
python app.py
```
This will run the backend API at:
📍 http://127.0.0.1:5000

### 3. Set Up the Frontend (React)

start a new terminal and run:
```bash
cd front-end
npm install
npm start
```
This will open the app in your browser at:
📍 http://localhost:3000


### ⚠️ Scapy Permission Issue (`/dev/bpf0`)

If you couldn't see any results after clicking the traceroute button, this might be a scapy permission issue.

Permission denied: could not open /dev/bpf0. Make sure to be running Scapy as root! (sudo)

#### On Mac OS or Lunix

This error occurs because Scapy needs root (administrator) access to interact with low-level network interfaces like `/dev/bpf0`. To resolve this issue, follow these steps:

1. **Run Scapy as Root (with `sudo`)**

   run your Python script as root to allow Scapy to access network interfaces.

   Run your script with `sudo`:

   ```bash
   sudo python3 backend/app.py
   ```
   



