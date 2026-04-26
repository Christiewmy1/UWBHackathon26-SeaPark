# filepath: backend/services/ml.py
"""
ML Service for SeaPark Backend
================================

This service handles machine learning for parking predictions and AI.

Services:
---------
1. Availability Prediction - Predict parking availability
2. Husky AI Integration - LLM for natural language queries
3. Pattern Analysis - Analyze parking patterns over time

Tech Stack:
-----------
- Gemma 4 (for AI queries)
- Scikit-learn (for predictions)
- NumPy (for data processing)

Team Assignment: 1 developer
Time Estimate: 4-5 hours
"""

from typing import List, Dict, Optional
import requests
import json
from datetime import datetime, timedelta

# TODO: Import ML libraries
# import numpy as np
# from sklearn.ensemble import RandomForestRegressor


# Gemma API Configuration
# TODO: Get actual API endpoint and key
GEMMA_API_ENDPOINT = "https://api.google.com/gemma/v1/generate"
GEMMA_API_KEY = "YOUR_GEMMA_API_KEY"  # TODO: Set environment variable


# ============================================================================
# Availability Prediction
# ============================================================================

def predict_availability(
    lot_id: str,
    target_time: Optional[datetime] = None,
) -> Dict:
    """
    Predict parking availability at a specific time.
    
    Uses historical data and patterns to predict:
    - Current availability
    - Expected availability at target time
    - Confidence score
    
    Args:
        lot_id: Parking lot ID
        target_time: Time to predict for (default: now)
        
    Returns:
        dict: Prediction with availability and confidence
    """
    # TODO: Implement ML prediction
    # 1. Load historical data for this lot
    # 2. Extract features (day of week, time, events, weather)
    # 3. Run through trained model
    # 4. Return prediction with confidence
    
    return {
        "lot_id": lot_id,
        "predicted_availability": "high",  # high/limited/full
        "confidence": 0.0,
        "predicted_for": target_time.isoformat() if target_time else datetime.now().isoformat(),
    }


def train_availability_model():
    """
    Train the availability prediction model.
    
    Uses historical report data to train a Random Forest model.
    
    Features:
    - Day of week (0-6)
    - Hour of day (0-23)
    - Recent report count
    - Time since last report
    - Event indicators
    
    Target:
    - Availability (high/limited/full)
    
    TODO: Implement model training
    """
    # TODO: Implement
    # 1. Load historical reports from Firebase
    # 2. Extract features and labels
    # 3. Split into train/test
    # 4. Train Random Forest model
    # 5. Save model for inference
    pass


def get_popularity_pattern(lot_id: str) -> Dict:
    """
    Get typical popularity pattern for a parking lot.
    
    Returns hourly and daily patterns to help users plan.
    
    Args:
        lot_id: Parking lot ID
        
    Returns:
        dict: Pattern data with peak times
    """
    # TODO: Implement pattern analysis
    return {
        "lot_id": lot_id,
        "peak_hours": [],  # List of hours with high demand
        "peak_days": [],   # List of days with high demand
        "typical_wait": 0, # minutes
    }


# ============================================================================
# Husky AI Integration
# ============================================================================

def query_husky_ai(
    user_query: str,
    user_location: Optional[Dict] = None,
    user_id: Optional[str] = None,
) -> Dict:
    """
    Query Husky AI assistant for parking assistance.
    
    Uses Gemma 4 LLM specialized in Seattle parking laws and data.
    
    Args:
        user_query: Natural language question
        user_location: User's current location (optional)
        user_id: User ID for personalized responses (optional)
        
    Returns:
        dict: AI response with suggestions
    """
    # TODO: Implement AI query
    # 1. Build prompt with Seattle parking context
    # 2. Call Gemma API
    # 3. Parse response
    # 4. Optionally get nearby parking suggestions
    
    # Example prompt construction:
    # prompt = f"""You are Husky AI, a Seattle parking expert.
    # User question: {user_query}
    # User location: {user_location}
    # Current date: {datetime.now().strftime('%Y-%m-%d')}
    # Is today a free parking day (Sunday/Holiday)? {check_holiday()}
    # """
    
    return {
        "response": "Husky AI is ready to help you find parking in Seattle!",
        "suggested_locations": [],
        "confidence": 0.0,
    }


def build_ai_prompt(
    query: str,
    location: Optional[Dict] = None,
    context: Optional[Dict] = None,
) -> str:
    """
    Build a prompt for the AI model with Seattle parking context.
    
    Args:
        query: User's question
        location: User's location
        context: Additional context (free parking day, events, etc.)
        
    Returns:
        str: Formatted prompt for AI
    """
    # TODO: Implement prompt building
    prompt = f"""You are Husky AI, a specialized parking assistant for Seattle.
    
User Query: {query}

Current Context:
- Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- Day: {datetime.now().strftime('%A')}
- Is Free Parking Day: {is_free_parking_day()}
- Location: {location}

Seattle Parking Rules to consider:
- Free on Sundays
- Free on major holidays
- RPZ restrictions in residential areas
- Time limits vary by zone
- Event days (Kraken, Mariners games) affect availability

Provide helpful, accurate information about Seattle parking.
Keep responses concise and actionable.
"""
    
    return prompt


def is_free_parking_day() -> bool:
    """
    Check if today is a free parking day in Seattle.
    
    Free parking days:
    - Sundays
    - Major holidays (see holiday list)
    
    Returns:
        bool: True if free parking today
    """
    now = datetime.now()
    
    # Sundays are always free
    if now.weekday() == 6:  # Sunday
        return True
    
    # TODO: Check holidays
    # holidays = get_holiday_list()
    # if now.date() in holidays:
    #     return True
    
    return False


def get_ai_suggestions(
    query: str,
    user_lat: float,
    user_lng: float,
) -> List[Dict]:
    """
    Get parking location suggestions based on AI response.
    
    Args:
        query: User's search query
        user_lat: User's latitude
        user_lng: User's longitude
        
    Returns:
        list: Suggested parking locations with details
    """
    # TODO: Implement suggestion extraction
    # 1. Parse AI response for location hints
    # 2. Search database for matching locations
    # 3. Return ranked suggestions
    
    return []


# ============================================================================
# Pattern Analysis
# ============================================================================

def analyze_event_impact(event_type: str, date: datetime) -> Dict:
    """
    Analyze parking impact for events.
    
    Args:
        event_type: Type of event (kraken/mariners/concert)
        date: Event date
        
    Returns:
        dict: Impact analysis with suggestions
    """
    # TODO: Implement event analysis
    return {
        "event_type": event_type,
        "date": date.isoformat(),
        "expected_occupancy": "high",
        "suggested_alternate_areas": [],
        "transit_options": [],
    }


def get_trending_spots() -> List[Dict]:
    """
    Get currently trending parking spots based on recent activity.
    
    Returns:
        list: Hot spots with high recent report activity
    """
    # TODO: Implement trending analysis
    return []


if __name__ == "__main__":
    print("ML Service - TODO: Implement ML and AI features")
    print(f"Free parking today: {is_free_parking_day()}")