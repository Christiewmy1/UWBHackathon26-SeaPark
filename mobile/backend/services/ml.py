import math
from datetime import datetime

def time_factor(hour):
    # downtown demand curve (simple sine model)
    return 0.5 + 0.5 * math.sin((hour - 8) / 24 * 2 * math.pi)

def predict_availability(lot):
    now = datetime.now()
    hour = now.hour

    base = lot.get("base_availability", 0.5)

    demand = time_factor(hour)

    # adjust prediction
    prediction = base - (0.3 * demand)

    return max(0, min(1, prediction))