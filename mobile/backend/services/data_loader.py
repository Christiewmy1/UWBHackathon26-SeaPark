import requests

LOTS_URL = "https://data.seattle.gov/resource/3qbw-quib.json"

def load_lots():
    res = requests.get(LOTS_URL)
    data = res.json()

    return [
        {
            "id": d.get("facility_id"),
            "name": d.get("name"),
            "lat": float(d.get("latitude", 0)),
            "lng": float(d.get("longitude", 0)),
            "total_stalls": int(d.get("total_spaces", 0))
        }
        for d in data
        if d.get("latitude") and d.get("longitude")
    ]