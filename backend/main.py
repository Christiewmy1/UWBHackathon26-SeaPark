"""
SeaPark Backend - FastAPI Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, date
import uvicorn
import os
import httpx
from dotenv import load_dotenv

load_dotenv(".env.local", override=True)
load_dotenv()  # fallback to .env if .env.local missing

SDOT_APP_TOKEN = os.getenv("SDOT_APP_TOKEN", "")
SDOT_OCCUPANCY_URL = (
    "https://data.seattle.gov/resource/7jzm-ucez.json"
    "?$where=study_year='2019'"
    "&$select=study_area,date_time,parking_spaces,total_vehicle_count"
    "&$limit=8000"
    f"&$$app_token={SDOT_APP_TOKEN}"
)

# Cached occupancy rates: {study_area: {hour: avg_occupancy_pct}}
_occupancy_cache: Dict[str, Dict[int, float]] = {}

app = FastAPI(title="SeaPark API", version="1.0.0", docs_url="/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# SDOT occupancy data loader
# ============================================================================

async def _load_sdot_occupancy():
    """Fetch 2019 SDOT occupancy survey and build hour→rate lookup per neighborhood."""
    global _occupancy_cache
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(SDOT_OCCUPANCY_URL)
            resp.raise_for_status()
            rows = resp.json()

        # Accumulate: area → hour → [occupancy_pcts]
        buckets: Dict[str, Dict[int, list]] = {}
        for row in rows:
            area = row.get("study_area")
            dt_str = row.get("date_time", "")
            spaces = int(row.get("parking_spaces") or 0)
            vehicles = int(row.get("total_vehicle_count") or 0)
            if not area or spaces <= 0 or not dt_str:
                continue
            try:
                # date_time format: "4/23/2019 14:00"
                hour = int(dt_str.split(" ")[1].split(":")[0])
            except (IndexError, ValueError):
                continue
            pct = min(1.0, vehicles / spaces)
            buckets.setdefault(area, {}).setdefault(hour, []).append(pct)

        _occupancy_cache = {
            area: {h: sum(vals) / len(vals) for h, vals in hours.items()}
            for area, hours in buckets.items()
        }
        print(f"[SDOT] Loaded occupancy patterns for {len(_occupancy_cache)} study areas")
    except Exception as exc:
        print(f"[SDOT] Failed to load occupancy data: {exc} — using static estimates")


@app.on_event("startup")
async def startup():
    if SDOT_APP_TOKEN:
        import asyncio
        asyncio.create_task(_load_sdot_occupancy())
    else:
        print("[SDOT] No app token — skipping live occupancy fetch")


# ============================================================================
# Helpers
# ============================================================================

def _is_meter_free_today() -> bool:
    d = date.today()
    if d.weekday() == 6:  # Sunday
        return True
    holidays = [(1, 1), (7, 4), (12, 25)]
    return (d.month, d.day) in holidays


def _current_occupancy(sdot_area: str, fallback_pct: float) -> float:
    """Return best-guess occupancy fraction for right now."""
    if not _occupancy_cache or sdot_area not in _occupancy_cache:
        return fallback_pct
    hour = datetime.now().hour
    area_hours = _occupancy_cache[sdot_area]
    if hour in area_hours:
        return area_hours[hour]
    # Nearest available hour
    closest = min(area_hours.keys(), key=lambda h: abs(h - hour))
    return area_hours[closest]


def _make_lot(
    lot_id: str, name: str, lat: float, lng: float,
    category: str, price: Optional[float],
    total: int, fallback_occupied_pct: float,
    time_pattern: str, address: str = "",
    sdot_area: str = "",
) -> dict:
    free_today = category == "free" or _is_meter_free_today()
    occ = _current_occupancy(sdot_area, fallback_occupied_pct)
    available = max(0, int(total * (1 - occ)))
    has_live = bool(_occupancy_cache and sdot_area in _occupancy_cache)
    freshness = "Live SDOT estimate" if has_live else "Estimated"
    confidence = 0.80 if has_live else 0.65
    return {
        "lotId": lot_id,
        "name": name,
        "lat": lat,
        "lng": lng,
        "totalStalls": total,
        "estimatedAvailable": available,
        "confidence": confidence,
        "isEstimate": True,
        "lastReportedMinutesAgo": None,
        "pricePerHour": price,
        "category": category,
        "meterFreeToday": free_today,
        "timePattern": time_pattern,
        "freshnessLabel": freshness,
        "address": address,
        "sdotArea": sdot_area,
    }


# ============================================================================
# Lot definitions  (sdot_area maps to 7jzm-ucez study_area values)
# ============================================================================

def _build_lots():
    return [
        # --- Downtown / Pike Place ---
        _make_lot("pp-market-garage", "Pike Place Market Garage", 47.6093, -122.3424, "garage", 4.0, 250, 0.65, "busy", "1531 Western Ave", "Commercial Core"),
        _make_lot("pacific-place", "Pacific Place Parking Garage", 47.6113, -122.3358, "garage", 3.50, 1100, 0.55, "moderate", "600 Pine St", "Commercial Core"),
        _make_lot("convention-place", "Convention Place Garage", 47.6124, -122.3326, "garage", 2.50, 660, 0.50, "moderate", "900 Pike St", "Commercial Core"),
        _make_lot("harbor-steps", "Harbor Steps Garage", 47.6072, -122.3393, "garage", 3.00, 300, 0.45, "moderate", "1221 1st Ave", "Commercial Core"),
        _make_lot("2nd-pike-metered", "2nd Ave & Pike St Metered Zone", 47.6108, -122.3391, "metered", 2.50, 28, 0.70, "busy", "2nd Ave & Pike St", "Commercial Core"),
        _make_lot("3rd-pike-metered", "3rd Ave & Pike St Metered Zone", 47.6112, -122.3375, "metered", 2.50, 22, 0.75, "busy", "3rd Ave & Pike St", "Commercial Core"),
        _make_lot("western-ave-metered", "Western Ave Metered Zone", 47.6085, -122.3419, "metered", 2.50, 35, 0.55, "moderate", "Western Ave & Union St", "Commercial Core"),

        # --- Belltown ---
        _make_lot("belltown-1st", "1st Ave Belltown Metered Zone", 47.6163, -122.3453, "metered", 2.50, 25, 0.40, "moderate", "1st Ave & Bell St", "Belltown"),
        _make_lot("belltown-garage", "Belltown Courtyard Garage", 47.6147, -122.3468, "garage", 3.00, 180, 0.35, "quiet", "2nd Ave & Blanchard St", "Belltown"),
        _make_lot("belltown-3rd", "3rd Ave Belltown Metered Zone", 47.6170, -122.3433, "metered", 2.50, 20, 0.30, "quiet", "3rd Ave & Cedar St", "Belltown"),

        # --- Seattle Center ---
        _make_lot("seattle-center-main", "Seattle Center Main Garage", 47.6222, -122.3519, "garage", 2.50, 900, 0.50, "moderate", "301 Mercer St", "Uptown"),
        _make_lot("mercer-lot", "Mercer Street Surface Lot", 47.6230, -122.3489, "lot", 1.50, 150, 0.35, "quiet", "200 Mercer St", "Uptown"),
        _make_lot("seattle-center-north", "Seattle Center North Lot", 47.6250, -122.3528, "lot", 2.00, 200, 0.40, "moderate", "N 2nd Ave & Thomas St", "Uptown Triangle"),

        # --- South Lake Union ---
        _make_lot("slu-westlake-denny", "Westlake & Denny Metered Zone", 47.6186, -122.3374, "metered", 2.00, 40, 0.40, "moderate", "Westlake Ave N & Denny Way", "South Lake Union"),
        _make_lot("slu-yale-garage", "Yale Ave N Garage", 47.6217, -122.3358, "garage", 2.00, 200, 0.45, "moderate", "222 Yale Ave N", "South Lake Union"),
        _make_lot("slu-boren-metered", "Boren Ave N Metered Zone", 47.6198, -122.3341, "metered", 2.00, 30, 0.35, "quiet", "Boren Ave N & Thomas St", "South Lake Union"),

        # --- Capitol Hill ---
        _make_lot("cap-hill-broadway-john", "Broadway & John Metered Zone", 47.6228, -122.3208, "metered", 2.50, 35, 0.65, "busy", "Broadway E & E John St", "Capitol Hill"),
        _make_lot("cap-hill-marketplace", "Broadway Marketplace Garage", 47.6244, -122.3190, "garage", 2.50, 220, 0.55, "moderate", "600 Broadway E", "Capitol Hill"),
        _make_lot("cap-hill-15th", "15th Ave E Metered Zone", 47.6240, -122.3134, "metered", 2.50, 20, 0.40, "moderate", "15th Ave E & E Pine St", "Capitol Hill"),
        _make_lot("cap-hill-summit", "Summit Ave E Street Zone", 47.6218, -122.3199, "metered", 2.50, 18, 0.30, "quiet", "Summit Ave E & E Pike St", "Pike-Pine"),

        # --- First Hill ---
        _make_lot("first-hill-terry", "Terry Ave Metered Zone", 47.6095, -122.3250, "metered", 2.50, 20, 0.50, "moderate", "Terry Ave & Spring St", "First Hill"),
        _make_lot("swedish-garage", "Swedish Hospital Garage", 47.6086, -122.3228, "garage", 3.00, 400, 0.70, "busy", "500 Minor Ave", "First Hill"),

        # --- SoDo / Sports Venues ---
        _make_lot("sodo-1stave-lot", "1st Ave S Event Lot", 47.5945, -122.3319, "lot", 3.00, 500, 0.30, "quiet", "1st Ave S & S Royal Brougham Way", "Pioneer Square"),
        _make_lot("sodo-occidental", "Occidental Ave S Lot", 47.5920, -122.3296, "lot", 3.50, 400, 0.25, "quiet", "Occidental Ave S & S Edgar Martinez Dr", "Pioneer Square"),
        _make_lot("lumen-field-garage", "Lumen Field Parking Garage", 47.5953, -122.3322, "garage", 4.00, 600, 0.25, "quiet", "800 Occidental Ave S", "Pioneer Square"),
        _make_lot("tmobile-lot-north", "T-Mobile Park North Lot", 47.5917, -122.3330, "lot", 3.50, 350, 0.25, "quiet", "1250 1st Ave S", "Pioneer Square"),

        # --- Pioneer Square ---
        _make_lot("pioneer-sq-1st", "1st Ave S Pioneer Square Lot", 47.6013, -122.3337, "lot", 2.00, 120, 0.40, "moderate", "1st Ave S & S Washington St", "Pioneer Square"),
        _make_lot("pioneer-sq-metered", "Occidental Ave S Metered Zone", 47.6030, -122.3316, "metered", 2.00, 25, 0.45, "moderate", "Occidental Ave S & S Main St", "Pioneer Square"),

        # --- Waterfront ---
        _make_lot("pier-69-lot", "Pier 69 Waterfront Lot", 47.6128, -122.3476, "lot", 3.00, 100, 0.55, "moderate", "2711 Alaskan Way", "Commercial Core"),
        _make_lot("seattle-aquarium-garage", "Seattle Aquarium Garage", 47.6069, -122.3429, "garage", 3.50, 180, 0.60, "busy", "1483 Alaskan Way", "Commercial Core"),

        # --- University District ---
        _make_lot("uw-medical-garage", "UW Medical Center Garage", 47.6494, -122.3068, "garage", 2.50, 300, 0.75, "busy", "1959 NE Pacific St", "University District"),
        _make_lot("u-district-ne45", "NE 45th St Metered Zone", 47.6608, -122.3144, "metered", 2.00, 30, 0.50, "moderate", "NE 45th St & University Way NE", "University District"),

        # --- Fremont ---
        _make_lot("fremont-36th", "N 36th St Fremont Street Zone", 47.6503, -122.3502, "metered", 1.50, 30, 0.40, "moderate", "N 36th St & Fremont Ave N", "Fremont"),
        _make_lot("fremont-aurora-lot", "Aurora Ave N Lot", 47.6520, -122.3471, "lot", 1.00, 80, 0.30, "quiet", "Aurora Ave N & N 38th St", "Fremont"),
    ]


# In-memory reports
reports_store: List[Dict] = []


# ============================================================================
# Pydantic Models
# ============================================================================

class ParkingReportIn(BaseModel):
    lot_id: str
    user_id: str = "anonymous"
    report_type: str
    latitude: float
    longitude: float


class AIQueryRequest(BaseModel):
    query: str
    user_id: Optional[str] = None
    location: Optional[dict] = None


# ============================================================================
# AI Rule Engine
# ============================================================================

def _rule_based_ai(query: str) -> str:
    q = query.lower()
    is_sunday = date.today().weekday() == 6
    free_note = "Today is FREE metered parking (Sunday)! " if is_sunday else ""

    if "free" in q or "sunday" in q or "holiday" in q:
        today_msg = "Today IS free!" if is_sunday else "Next free day: this Sunday."
        return (
            f"Seattle meters are free on Sundays and 8 holidays "
            f"(New Year's, MLK Day, Presidents Day, Memorial Day, July 4, "
            f"Labor Day, Thanksgiving, Christmas). {today_msg}"
        )
    if "pike place" in q:
        return (
            "Near Pike Place: Pike Place Market Garage on Western Ave is covered at ~$4/hr. "
            "Western Ave metered spots at $2.50/hr. Arrive before 10 AM on weekdays for the best street spots."
        )
    if "kraken" in q or "climate pledge" in q or "arena" in q:
        return (
            "For Climate Pledge Arena events: SoDo lots on 1st Ave S ($20–30 event pricing). "
            "Seattle Center Garage is closer but pricier. Arrive 45+ min early. "
            "Link Light Rail to Seattle Center Station is the stress-free option."
        )
    if "mariners" in q or "t-mobile" in q or "baseball" in q:
        return (
            "For T-Mobile Park: 1st Ave S and Occidental Ave S game-day lots ($25–40). "
            "Airport Way S has cheaper options a 10-min walk away. Arrive 1 hour before first pitch."
        )
    if "seahawks" in q or "sounders" in q or "lumen" in q or "soccer" in q or "football" in q:
        return (
            "For Lumen Field: Lumen Field Parking Garage is steps away (~$4/hr, event surcharges apply). "
            "Occidental Ave S and 1st Ave S SoDo lots are cheaper alternatives. Book ahead for playoff games."
        )
    if "capitol hill" in q:
        return (
            "Capitol Hill: Broadway Marketplace Garage (600 Broadway E) runs ~$2.50/hr. "
            "15th Ave E and Summit Ave E have metered street spots. Avoid RPZ-marked residential blocks."
        )
    if "downtown" in q or "pike" in q or "pine" in q:
        return (
            f"{free_note}Downtown Seattle: 2nd and 3rd Ave metered spots at $2.50/hr. "
            "Pacific Place Garage (600 Pine St) has 1,100 spaces. "
            "Convention Place Garage is cheaper at $2.50/hr."
        )
    if "belltown" in q:
        return (
            "Belltown: Belltown Courtyard Garage on 2nd Ave is usually quiet (~$3/hr). "
            "1st Ave metered spots at $2.50/hr. Evenings are generally easy to find parking."
        )
    if "slu" in q or "south lake union" in q or "amazon" in q:
        return (
            "South Lake Union: Yale Ave N Garage at $2/hr. "
            "Westlake & Denny metered zone is convenient for the area. "
            "Evening parking is easier after 6 PM when offices close."
        )
    if "cheap" in q or "budget" in q or "affordable" in q:
        return (
            "Best budget parking: (1) Sundays are free everywhere metered. "
            "(2) SoDo surface lots on 1st Ave S are ~$1–2/hr off-peak. "
            "(3) Fremont lots on Aurora Ave N at $1/hr. "
            "(4) Park on the edge of a neighborhood and walk 5–10 min."
        )
    if "safe" in q or "break" in q or "security" in q:
        return (
            "Safest: covered garages like Pacific Place, Seattle Center, or Broadway Marketplace. "
            "Seattle has high car break-in rates — never leave anything visible. "
            "Well-lit metered spots on busy streets (Broadway, Pine St) are generally fine at night."
        )

    return (
        f"{free_note}Metered parking in Seattle runs $1.50–3.50/hr. Free on Sundays and 8 holidays. "
        "Tap any marker on the map for specific lot details. "
        "Ask me about Pike Place, Capitol Hill, SoDo events, downtown, or cheap parking tips!"
    )


# ============================================================================
# Endpoints
# ============================================================================

@app.get("/")
async def root():
    return {"message": "SeaPark API running", "docs": "/docs"}


@app.get("/api/v1/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "sdot_areas_loaded": len(_occupancy_cache),
    }


@app.get("/api/v1/parking/lots")
async def get_parking_lots(free_only: bool = False, limit: int = 200):
    lots = _build_lots()
    if free_only:
        lots = [l for l in lots if l["category"] == "free"]
    return lots[:limit]


@app.get("/api/v1/parking/lots/{lot_id}")
async def get_parking_lot(lot_id: str):
    for lot in _build_lots():
        if lot["lotId"] == lot_id:
            return lot
    return None


@app.get("/api/v1/parking/search")
async def search_parking(query: str):
    q = query.lower()
    results = [lot for lot in _build_lots() if q in lot["name"].lower() or q in lot.get("address", "").lower()]
    return {"results": results[:10], "query": query}


@app.post("/api/v1/reports")
async def create_report(report: ParkingReportIn):
    entry = {**report.model_dump(), "id": str(len(reports_store) + 1), "timestamp": datetime.now().isoformat()}
    reports_store.append(entry)
    return {"message": "Report submitted", "id": entry["id"]}


@app.get("/api/v1/reports")
async def get_reports(lot_id: Optional[str] = None, limit: int = 50):
    filtered = [r for r in reports_store if not lot_id or r.get("lot_id") == lot_id]
    return {"reports": filtered[-limit:]}


@app.post("/api/v1/ai/query")
async def husky_ai_query(request: AIQueryRequest):
    return {
        "response": _rule_based_ai(request.query),
        "suggested_locations": [],
        "confidence": 0.85,
    }


@app.get("/api/v1/seattle/holidays")
async def get_holidays():
    return {
        "is_free_day": _is_meter_free_today(),
        "next_free_day": "Sunday",
        "holidays": ["New Year's Day", "MLK Jr. Day", "Presidents Day", "Memorial Day",
                     "Independence Day", "Labor Day", "Thanksgiving", "Christmas Day"],
    }


@app.get("/api/v1/parking/heatmap")
async def get_heatmap():
    return {"points": []}


@app.get("/api/v1/users/{user_id}/favorites")
async def get_favorites(user_id: str):
    return {"favorites": []}


@app.post("/api/v1/users/{user_id}/favorites")
async def add_favorite(user_id: str, lot_id: str):
    return {"message": "Favorite added"}


@app.delete("/api/v1/users/{user_id}/favorites/{lot_id}")
async def remove_favorite(user_id: str, lot_id: str):
    return {"message": "Favorite removed"}


@app.get("/api/v1/users/{user_id}/history")
async def get_history(user_id: str, limit: int = 20):
    return {"history": []}


@app.get("/api/v1/seattle/rpz")
async def get_rpz(latitude: float, longitude: float):
    return {"rpz_zones": []}


@app.get("/api/v1/seattle/events")
async def get_events():
    return {"events": [], "suggestions": []}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
