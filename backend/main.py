# filepath: backend/main.py
"""
SeaPark Backend - FastAPI Application
=====================================

This is the main entry point for the SeaPark backend API.
Built with FastAPI for high performance and async support.

Tech Stack:
- FastAPI (Python web framework)
- Firebase Admin SDK (database & auth)
- Uvicorn (ASGI server)

API Endpoints (CRUD Architecture):
----------------------------------
GET    /api/v1/parking/lots          - Get all parking lots
GET    /api/v1/parking/lots/{id}     - Get single parking lot
POST   /api/v1/parking/lots          - Create new parking lot
PUT    /api/v1/parking/lots/{id}     - Update parking lot
DELETE /api/v1/parking/lots/{id}     - Delete parking lot

GET    /api/v1/parking/search        - Search parking spots
GET    /api/v1/parking/heatmap      - Get heatmap data

POST   /api/v1/reports               - Submit parking report
GET    /api/v1/reports              - Get recent reports

POST   /api/v1/ai/query             - Husky AI query endpoint

CORS Configuration:
------------------
- Allow origins: http://localhost:3000, exp://
- Allow methods: GET, POST, PUT, DELETE, OPTIONS
- Allow headers: Content-Type, Authorization

Team Assignment:
----------------
- 1 developer for API endpoints
- 1 developer for Firebase integration
- 1 developer for AI integration

Time Estimate: 8-10 hours for backend setup
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uvicorn

# TODO: Import services (to be implemented)
# from services.data_loader import DataLoader
# from services.ml import MLService
# from services.scoring import ScoringService
# from firebase.firebaseAdmin import initialize_firebase, get_db

# Initialize FastAPI app
app = FastAPI(
    title="SeaPark API",
    description="Seattle Parking Navigator Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ============================================================================
# CORS Configuration
# ============================================================================
# TODO: Update with actual production URLs before deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8081",
        "exp://localhost:8081",
        "exp://127.0.0.1:8081",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
)

# ============================================================================
# Pydantic Models (Request/Response Schemas)
# ============================================================================

class ParkingLotBase(BaseModel):
    """Base model for parking lot data"""
    name: str
    latitude: float
    longitude: float
    is_free: bool
    price_per_hour: Optional[float] = 0.0
    time_limit: Optional[str] = None
    address: Optional[str] = None
    zone_type: str  # "street", "garage", "lot", "metered"


class ParkingLotCreate(ParkingLotBase):
    """Model for creating a new parking lot"""
    pass


class ParkingLotUpdate(BaseModel):
    """Model for updating parking lot"""
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_free: Optional[bool] = None
    price_per_hour: Optional[float] = None
    time_limit: Optional[str] = None
    address: Optional[str] = None
    zone_type: Optional[str] = None
    availability: Optional[str] = None
    safe_score: Optional[float] = None
    clean_score: Optional[float] = None
    space_score: Optional[float] = None


class ParkingLotResponse(ParkingLotBase):
    """Model for parking lot response"""
    id: str
    availability: str  # "high", "limited", "full"
    safe_score: float = 0.0
    clean_score: float = 0.0
    space_score: float = 0.0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ParkingReport(BaseModel):
    """Model for user parking reports"""
    lot_id: str
    user_id: str
    report_type: str  # "parked", "leaving", "full"
    latitude: float
    longitude: float
    timestamp: datetime = datetime.now()


class AIQueryRequest(BaseModel):
    """Model for Husky AI queries"""
    query: str
    user_id: Optional[str] = None
    location: Optional[dict] = None


class AIQueryResponse(BaseModel):
    """Model for Husky AI responses"""
    response: str
    suggested_locations: Optional[List[dict]] = None
    confidence: float = 0.0


# ============================================================================
# API Endpoints - Parking Lots (CRUD)
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to SeaPark API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
    }


# ----------------------------------------------------------------------------
# GET - Retrieve all parking lots
# ----------------------------------------------------------------------------
@app.get("/api/v1/parking/lots", response_model=List[ParkingLotResponse])
async def get_parking_lots(
    free_only: bool = False,
    zone_type: Optional[str] = None,
    limit: int = 100,
):
    """
    Get all parking lots with optional filters.
    
    Query Parameters:
    - free_only: Filter for free parking only
    - zone_type: Filter by zone type (street, garage, lot, metered)
    - limit: Maximum number of results to return
    
    TODO: Implement actual database query
    TODO: Add pagination support
    """
    # TODO: Implement Firebase query
    # db = get_db()
    # query = db.collection('parking_lots')
    # if free_only:
    #     query = query.where('is_free', '==', True)
    # if zone_type:
    #     query = query.where('zone_type', '==', zone_type)
    # return query.limit(limit).get()
    
    return []


# ----------------------------------------------------------------------------
# GET - Retrieve single parking lot
# ----------------------------------------------------------------------------
@app.get("/api/v1/parking/lots/{lot_id}", response_model=ParkingLotResponse)
async def get_parking_lot(lot_id: str):
    """
    Get a single parking lot by ID.
    
    Path Parameters:
    - lot_id: The unique identifier of the parking lot
    
    TODO: Implement Firebase get
    """
    # TODO: Implement Firebase get
    # db = get_db()
    # doc = db.collection('parking_lots').document(lot_id).get()
    # if not doc.exists:
    #     raise HTTPException(status_code=404, detail="Parking lot not found")
    # return doc.to_dict()
    
    raise HTTPException(status_code=404, detail="Parking lot not found")


# ----------------------------------------------------------------------------
# POST - Create new parking lot
# ----------------------------------------------------------------------------
@app.post("/api/v1/parking/lots", response_model=ParkingLotResponse)
async def create_parking_lot(lot: ParkingLotCreate):
    """
    Create a new parking lot.
    
    Request Body:
    - name: Name of the parking lot
    - latitude: GPS latitude
    - longitude: GPS longitude
    - is_free: Whether parking is free
    - price_per_hour: Hourly rate (if not free)
    - time_limit: Time limit string (e.g., "2 Hour Limit, 8 AM - 6 PM")
    - address: Street address
    - zone_type: Type of parking zone
    
    TODO: Implement Firebase create
    """
    # TODO: Implement Firebase create
    # db = get_db()
    # doc_ref = db.collection('parking_lots').document()
    # lot_data = lot.dict()
    # lot_data['id'] = doc_ref.id
    # lot_data['created_at'] = datetime.now()
    # lot_data['updated_at'] = datetime.now()
    # lot_data['availability'] = 'high'
    # doc_ref.set(lot_data)
    # return lot_data
    
    raise HTTPException(status_code=501, detail="Not implemented")


# ----------------------------------------------------------------------------
# PUT - Update parking lot
# ----------------------------------------------------------------------------
@app.put("/api/v1/parking/lots/{lot_id}", response_model=ParkingLotResponse)
async def update_parking_lot(lot_id: str, lot: ParkingLotUpdate):
    """
    Update an existing parking lot.
    
    Path Parameters:
    - lot_id: The unique identifier of the parking lot
    
    Request Body:
    - All fields are optional - only provided fields will be updated
    
    TODO: Implement Firebase update
    """
    # TODO: Implement Firebase update
    # db = get_db()
    # doc_ref = db.collection('parking_lots').document(lot_id)
    # doc = doc_ref.get()
    # if not doc.exists:
    #     raise HTTPException(status_code=404, detail="Parking lot not found")
    # update_data = {k: v for k, v in lot.dict().items() if v is not None}
    # update_data['updated_at'] = datetime.now()
    # doc_ref.update(update_data)
    # return doc_ref.get().to_dict()
    
    raise HTTPException(status_code=501, detail="Not implemented")


# ----------------------------------------------------------------------------
# DELETE - Delete parking lot
# ----------------------------------------------------------------------------
@app.delete("/api/v1/parking/lots/{lot_id}")
async def delete_parking_lot(lot_id: str):
    """
    Delete a parking lot.
    
    Path Parameters:
    - lot_id: The unique identifier of the parking lot
    
    TODO: Implement Firebase delete
    """
    # TODO: Implement Firebase delete
    # db = get_db()
    # doc_ref = db.collection('parking_lots').document(lot_id)
    # doc = doc_ref.get()
    # if not doc.exists:
    #     raise HTTPException(status_code=404, detail="Parking lot not found")
    # doc_ref.delete()
    # return {"message": "Parking lot deleted successfully"}
    
    raise HTTPException(status_code=501, detail="Not implemented")


# ============================================================================
# API Endpoints - Search & Heatmap
# ============================================================================

@app.get("/api/v1/parking/search")
async def search_parking(
    query: str,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    radius: float = 1.0,  # km
):
    """
    Search for parking spots near a location or by query.
    
    Query Parameters:
    - query: Search query (e.g., "Pike Place Market")
    - latitude: User's current latitude
    - longitude: User's current longitude
    - radius: Search radius in kilometers
    
    TODO: Implement search with geolocation
    """
    # TODO: Implement search
    # - Use Firebase geospatial queries
    # - Integrate with Google Places API for address search
    # - Return ranked results by distance and availability
    
    return {"results": [], "query": query}


@app.get("/api/v1/parking/heatmap")
async def get_heatmap_data(
    latitude: float = 47.6062,
    longitude: float = -122.3321,
    radius: float = 5.0,  # km
):
    """
    Get heatmap data for parking density visualization.
    
    Query Parameters:
    - latitude: Center latitude
    - longitude: Center longitude
    - radius: Radius in kilometers
    
    Response:
    - Array of points with latitude, longitude, and weight
    
    TODO: Implement heatmap data aggregation
    """
    # TODO: Implement heatmap data
    # - Aggregate user reports by location
    # - Calculate density based on recent reports
    # - Return weighted points for heatmap rendering
    
    return {"points": []}


# ============================================================================
# API Endpoints - Reports (CRUD)
# ============================================================================

@app.post("/api/v1/reports")
async def create_report(report: ParkingReport):
    """
    Submit a parking status report.
    
    Request Body:
    - lot_id: ID of the parking lot
    - user_id: ID of the reporting user
    - report_type: "parked", "leaving", or "full"
    - latitude: Report location latitude
    - longitude: Report location longitude
    
    TODO: Implement report submission
    """
    # TODO: Implement report submission
    # - Validate report data
    # - Store in Firebase
    # - Update parking lot availability based on report
    # - Trigger real-time update to connected clients
    
    return {"message": "Report submitted successfully"}


@app.get("/api/v1/reports")
async def get_reports(
    lot_id: Optional[str] = None,
    limit: int = 50,
):
    """
    Get recent parking reports.
    
    Query Parameters:
    - lot_id: Filter by parking lot ID
    - limit: Maximum number of results
    
    TODO: Implement reports retrieval
    """
    # TODO: Implement reports retrieval
    # - Query Firebase for recent reports
    # - Apply filters if provided
    
    return {"reports": []}


# ============================================================================
# API Endpoints - Husky AI
# ============================================================================

@app.post("/api/v1/ai/query", response_model=AIQueryResponse)
async def husky_ai_query(request: AIQueryRequest):
    """
    Husky AI Assistant endpoint for natural language parking queries.
    
    Request Body:
    - query: User's natural language question
    - user_id: Optional user ID for personalized responses
    - location: Optional user location for context
    
    Example:
    - User: "Where can I park for free near Pike Place right now?"
    - AI: "Street parking is free on Sundays! Otherwise, I recommend..."
    
    TODO: Implement AI integration with Gemma 4
    """
    # TODO: Implement AI query handling
    # - Format prompt for Gemma 4 API
    # - Include Seattle parking rules context
    # - Include user's location if provided
    # - Parse and return AI response
    # - Optionally include suggested parking locations
    
    return AIQueryResponse(
        response="Husky AI is ready to help you find parking in Seattle!",
        suggested_locations=None,
        confidence=0.0,
    )


# ============================================================================
# API Endpoints - User Preferences & History
# ============================================================================

@app.get("/api/v1/users/{user_id}/favorites")
async def get_user_favorites(user_id: str):
    """
    Get user's favorite parking locations.
    
    TODO: Implement favorites retrieval
    """
    # TODO: Implement favorites
    return {"favorites": []}


@app.post("/api/v1/users/{user_id}/favorites")
async def add_user_favorite(user_id: str, lot_id: str):
    """
    Add a parking lot to user's favorites.
    
    TODO: Implement favorite addition
    """
    # TODO: Implement favorite addition
    return {"message": "Favorite added"}


@app.delete("/api/v1/users/{user_id}/favorites/{lot_id}")
async def remove_user_favorite(user_id: str, lot_id: str):
    """
    Remove a parking lot from user's favorites.
    
    TODO: Implement favorite removal
    """
    # TODO: Implement favorite removal
    return {"message": "Favorite removed"}


@app.get("/api/v1/users/{user_id}/history")
async def get_user_history(user_id: str, limit: int = 20):
    """
    Get user's parking history.
    
    TODO: Implement history retrieval
    """
    # TODO: Implement history
    return {"history": []}


# ============================================================================
# Seattle-Specific Features
# ============================================================================

@app.get("/api/v1/seattle/holidays")
async def get_holiday_schedule():
    """
    Get Seattle holiday schedule for free parking rules.
    
    Seattle offers free parking on:
    - Sundays
    - New Year's Day
    - MLK Jr. Day
    - Presidents Day
    - Memorial Day
    - Independence Day (July 4th)
    - Labor Day
    - Thanksgiving
    - Christmas Day
    
    TODO: Implement holiday checking logic
    """
    # TODO: Implement holiday schedule
    return {
        "is_free_day": False,  # Check if today is a free parking day
        "next_free_day": "Sunday",
        "holidays": [],
    }


@app.get("/api/v1/seattle/rpz")
async def get_rpz_zones(
    latitude: float,
    longitude: float,
    radius: float = 1.0,
):
    """
    Get Restricted Parking Zones (RPZ) near a location.
    
    This helps users avoid $50 tickets for parking in residential permit zones.
    
    TODO: Implement RPZ zone data
    """
    # TODO: Implement RPZ data
    return {"rpz_zones": []}


@app.get("/api/v1/seattle/events")
async def get_event_parking(
    event_type: Optional[str] = None,
    date: Optional[str] = None,
):
    """
    Get parking suggestions for events (Kraken, Mariners games, etc.).
    
    TODO: Implement event integration
    """
    # TODO: Implement event parking suggestions
    return {"events": [], "suggestions": []}


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    # TODO: Uncomment after Firebase setup
    # initialize_firebase()
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )