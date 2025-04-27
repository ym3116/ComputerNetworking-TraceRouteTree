import json

def save_raw_results(results, filename):
    with open(filename, 'w') as f:
        json.dump(results, f, indent=2)
