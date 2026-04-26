# filepath: backend/services/scoring.py
"""
Scoring Service for SeaPark Backend
=====================================

This service handles user-generated ratings for parking areas.

Scores:
-------
1. Safe-Score: Lighting quality and foot traffic (0-10)
2. Clean-Score: Presence of litter and neighborhood upkeep (0-10)
3. Space-Score: Is it a "tight squeeze" or wide enough for SUVs? (0-10)

Functions:
----------
- calculate_scores(): Aggregate user ratings
- submit_rating(): Submit a new user rating
- get_scores(): Get scores for a parking lot

Team Assignment: 1 developer
Time Estimate: 2-3 hours
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta

# TODO: Import Firebase
# from firebase.firebaseAdmin import get_db


# ============================================================================
# Score Calculation
# ============================================================================

def calculate_scores(lot_id: str) -> Dict:
    """
    Calculate aggregate scores for a parking lot.
    
    Aggregates all user ratings to produce:
    - Average safe_score
    - Average clean_score
    - Average space_score
    - Total number of ratings
    
    Args:
        lot_id: Parking lot ID
        
    Returns:
        dict: Aggregate scores
    """
    # TODO: Implement score calculation
    # db = get_db()
    # ratings = db.collection('ratings').where('lot_id', '==', lot_id).get()
    # 
    # if not ratings:
    #     return default_scores()
    # 
    # safe_scores = [r.get('safe_score') for r in ratings]
    # clean_scores = [r.get('clean_score') for r in ratings]
    # space_scores = [r.get('space_score') for r in ratings]
    # 
    # return {
    #     "lot_id": lot_id,
    #     "safe_score": sum(safe_scores) / len(safe_scores),
    #     "clean_score": sum(clean_scores) / len(clean_scores),
    #     "space_score": sum(space_scores) / len(space_scores),
    #     "total_ratings": len(ratings),
    # }
    
    return {
        "lot_id": lot_id,
        "safe_score": 0.0,
        "clean_score": 0.0,
        "space_score": 0.0,
        "total_ratings": 0,
    }


def default_scores() -> Dict:
    """
    Get default scores for new parking lots.
    
    Returns:
        dict: Default score values
    """
    return {
        "safe_score": 5.0,
        "clean_score": 5.0,
        "space_score": 5.0,
        "total_ratings": 0,
    }


# ============================================================================
# Rating Submission
# ============================================================================

def submit_rating(
    lot_id: str,
    user_id: str,
    safe_score: float,
    clean_score: float,
    space_score: float,
    comment: Optional[str] = None,
) -> Dict:
    """
    Submit a user rating for a parking lot.
    
    Args:
        lot_id: Parking lot ID
        user_id: User's unique ID
        safe_score: Safety rating (0-10)
        clean_score: Cleanliness rating (0-10)
        space_score: Space rating (0-10)
        comment: Optional user comment
        
    Returns:
        dict: Created rating
    """
    # TODO: Implement rating submission
    # 1. Validate scores are in range 0-10
    # 2. Create rating document in Firebase
    # 3. Update lot's aggregate scores
    # 4. Return created rating
    
    rating_data = {
        "lot_id": lot_id,
        "user_id": user_id,
        "safe_score": min(10, max(0, safe_score)),
        "clean_score": min(10, max(0, clean_score)),
        "space_score": min(10, max(0, space_score)),
        "comment": comment,
        "created_at": datetime.now(),
    }
    
    # TODO: Store in Firebase
    # db = get_db()
    # doc_ref = db.collection('ratings').document()
    # rating_data['id'] = doc_ref.id
    # doc_ref.set(rating_data)
    
    return rating_data


def get_ratings(lot_id: str, limit: int = 20) -> List[Dict]:
    """
    Get recent ratings for a parking lot.
    
    Args:
        lot_id: Parking lot ID
        limit: Maximum number of ratings to return
        
    Returns:
        list: Recent ratings
    """
    # TODO: Implement ratings retrieval
    return []


def get_user_rating(user_id: str, lot_id: str) -> Optional[Dict]:
    """
    Get a specific user's rating for a parking lot.
    
    Args:
        user_id: User's unique ID
        lot_id: Parking lot ID
        
    Returns:
        dict or None: User's rating if exists
    """
    # TODO: Implement
    pass


def update_user_rating(
    user_id: str,
    lot_id: str,
    safe_score: float,
    clean_score: float,
    space_score: float,
    comment: Optional[str] = None,
) -> Dict:
    """
    Update an existing user rating.
    
    Args:
        user_id: User's unique ID
        lot_id: Parking lot ID
        safe_score: Updated safety rating
        clean_score: Updated cleanliness rating
        space_score: Updated space rating
        comment: Updated comment
        
    Returns:
        dict: Updated rating
    """
    # TODO: Implement rating update
    pass


def delete_rating(rating_id: str) -> bool:
    """
    Delete a user rating.
    
    Args:
        rating_id: Rating document ID
        
    Returns:
        bool: True if deleted successfully
    """
    # TODO: Implement rating deletion
    pass


# ============================================================================
# Score Analysis
# ============================================================================

def get_top_rated_spots(zone_type: Optional[str] = None, limit: int = 10) -> List[Dict]:
    """
    Get top rated parking spots.
    
    Args:
        zone_type: Optional filter by zone type
        limit: Maximum number of results
        
    Returns:
        list: Top rated parking lots
    """
    # TODO: Implement
    return []


def get_worst_rated_spots(limit: int = 10) -> List[Dict]:
    """
    Get worst rated parking spots.
    
    Args:
        limit: Maximum number of results
        
    Returns:
        list: Worst rated parking lots
    """
    # TODO: Implement
    return []


def get_score_distribution() -> Dict:
    """
    Get distribution of scores across all parking lots.
    
    Returns:
        dict: Score distribution statistics
    """
    # TODO: Implement
    return {
        "average_safe_score": 0.0,
        "average_clean_score": 0.0,
        "average_space_score": 0.0,
        "total_ratings": 0,
    }


# ============================================================================
# Real-time Score Updates
# ============================================================================

def subscribe_to_score_updates(lot_id: str, callback):
    """
    Subscribe to real-time score updates for a parking lot.
    
    Args:
        lot_id: Parking lot ID
        callback: Function to call when scores update
        
    Returns:
        function: Unsubscribe function
    """
    # TODO: Implement real-time subscription
    pass


if __name__ == "__main__":
    print("Scoring Service - TODO: Implement scoring features")
    print(f"Default scores: {default_scores()}")