from fastapi import FastAPI
from services.data_loader import load_lots
from services.scoring import compute_availability
from services.ml import predict_availability

app = FastAPI()

LOTS = load_lots()

@app.get("/lots")
def get_lots():
    enriched = []
    for lot in LOTS:
        score = compute_availability(lot)
        prediction = predict_availability(lot)

        enriched.append({
            **lot,
            "availability": score["availability"],
            "confidence": score["confidence"],
            "predicted_availability": prediction
        })

    return enriched