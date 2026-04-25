from datetime import datetime, timedelta

def compute_availability(lot):
    # simplified placeholder logic

    recent_usage = lot.get("recent_transactions", 0)
    total = max(lot.get("total_stalls", 1), 1)

    availability = max(0, min(1, 1 - (recent_usage / total)))

    confidence = 0.5 if recent_usage == 0 else 0.9

    return {
        "availability": availability,
        "confidence": confidence
    }