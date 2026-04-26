# filepath: backend/firebase/firebaseAdmin.py
"""
Firebase Admin Setup for SeaPark Backend
==========================================

This module initializes Firebase Admin SDK for the backend.
Required for database operations and authentication.

Setup Instructions:
------------------
1. Go to Firebase Console (https://console.firebase.google.com)
2. Create a new project or select existing project
3. Enable Firestore Database
4. Go to Project Settings > Service Accounts
5. Generate new private key (JSON)
6. Save the JSON file as serviceAccountKey.json in this folder
7. Update the path below to point to your JSON file

Environment Variables:
---------------------
- GOOGLE_APPLICATION_CREDENTIALS: Path to service account key
- FIREBASE_PROJECT_ID: Your Firebase project ID

Database Structure (Firestore):
-----------------------------
Collection: parking_lots
  - id: string (auto-generated)
  - name: string
  - latitude: float
  - longitude: float
  - is_free: boolean
  - price_per_hour: float
  - time_limit: string
  - address: string
  - zone_type: string (street/garage/lot/metered)
  - availability: string (high/limited/full)
  - safe_score: float (0-10)
  - clean_score: float (0-10)
  - space_score: float (0-10)
  - created_at: timestamp
  - updated_at: timestamp

Collection: reports
  - id: string (auto-generated)
  - lot_id: string
  - user_id: string
  - report_type: string (parked/leaving/full)
  - latitude: float
  - longitude: float
  - timestamp: timestamp

Collection: users
  - id: string (matches auth UID)
  - email: string
  - display_name: string
  - favorites: array of lot_ids
  - created_at: timestamp

Collection: user_history
  - id: string (auto-generated)
  - user_id: string
  - lot_id: string
  - action: string (parked/searched)
  - timestamp: timestamp

Team Assignment: 1 developer
Time Estimate: 2-3 hours
"""

import os
import json
from typing import Optional
import firebase_admin
from firebase_admin import credentials, firestore

# Global variables
firebase_app: Optional[firebase_admin.App] = None
db: Optional[firestore.Client] = None

# Path to service account key - UPDATE THIS
SERVICE_ACCOUNT_PATH = os.path.join(
    os.path.dirname(__file__), 
    "serviceAccountKey.json"
)


def initialize_firebase():
    """
    Initialize Firebase Admin SDK.
    
    This function must be called before any Firebase operations.
    
    TODO: Implement actual Firebase initialization
    """
    global firebase_app, db
    
    # TODO: Uncomment after setting up Firebase project
    # try:
    #     # Check if already initialized
    #     firebase_app = firebase_admin.get_app()
    #     db = firestore.client()
    #     print("Firebase already initialized")
    # except ValueError:
    #     # Initialize with service account
    #     if not os.path.exists(SERVICE_ACCOUNT_PATH):
    #         raise FileNotFoundError(
    #             f"Service account key not found at {SERVICE_ACCOUNT_PATH}. "
    #             "Please download from Firebase Console > Project Settings > Service Accounts"
    #         )
    #     
    #     cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    #     firebase_app = firebase_admin.initialize_app(cred)
    #     db = firestore.client()
    #     print("Firebase initialized successfully")
    
    print("Firebase initialization placeholder - TODO: Configure with actual credentials")


def get_db() -> firestore.Client:
    """
    Get Firestore database client.
    
    Returns:
        firestore.Client: Firestore database client
        
    Raises:
        RuntimeError: If Firebase not initialized
    """
    global db
    
    if db is None:
        # TODO: Uncomment after Firebase setup
        # initialize_firebase()
        raise RuntimeError("Firebase not initialized. Call initialize_firebase() first.")
    
    return db


# ============================================================================
# CRUD Operations - Parking Lots
# ============================================================================

def create_parking_lot(lot_data: dict) -> dict:
    """
    Create a new parking lot in Firestore.
    
    Args:
        lot_data: Dictionary containing parking lot data
        
    Returns:
        dict: Created parking lot with ID
    """
    # TODO: Implement
    # db = get_db()
    # doc_ref = db.collection('parking_lots').document()
    # lot_data['id'] = doc_ref.id
    # lot_data['created_at'] = firestore.SERVER_TIMESTAMP
    # lot_data['updated_at'] = firestore.SERVER_TIMESTAMP
    # doc_ref.set(lot_data)
    # return lot_data
    pass


def get_parking_lot(lot_id: str) -> Optional[dict]:
    """
    Get a parking lot by ID.
    
    Args:
        lot_id: The parking lot ID
        
    Returns:
        dict or None: Parking lot data if found
    """
    # TODO: Implement
    # db = get_db()
    # doc = db.collection('parking_lots').document(lot_id).get()
    # return doc.to_dict() if doc.exists else None
    pass


def get_all_parking_lots(
    free_only: bool = False,
    zone_type: Optional[str] = None,
    limit: int = 100,
) -> list:
    """
    Get all parking lots with optional filters.
    
    Args:
        free_only: Filter for free parking only
        zone_type: Filter by zone type
        limit: Maximum results
        
    Returns:
        list: List of parking lots
    """
    # TODO: Implement
    # db = get_db()
    # query = db.collection('parking_lots')
    # if free_only:
    #     query = query.where('is_free', '==', True)
    # if zone_type:
    #     query = query.where('zone_type', '==', zone_type)
    # return [doc.to_dict() for doc in query.limit(limit).get()]
    pass


def update_parking_lot(lot_id: str, update_data: dict) -> dict:
    """
    Update a parking lot.
    
    Args:
        lot_id: The parking lot ID
        update_data: Dictionary of fields to update
        
    Returns:
        dict: Updated parking lot
    """
    # TODO: Implement
    # db = get_db()
    # update_data['updated_at'] = firestore.SERVER_TIMESTAMP
    # db.collection('parking_lots').document(lot_id).update(update_data)
    # return get_parking_lot(lot_id)
    pass


def delete_parking_lot(lot_id: str) -> bool:
    """
    Delete a parking lot.
    
    Args:
        lot_id: The parking lot ID
        
    Returns:
        bool: True if deleted successfully
    """
    # TODO: Implement
    # db = get_db()
    # db.collection('parking_lots').document(lot_id).delete()
    # return True
    pass


# ============================================================================
# CRUD Operations - Reports
# ============================================================================

def create_report(report_data: dict) -> dict:
    """
    Create a new parking report.
    
    Args:
        report_data: Dictionary containing report data
        
    Returns:
        dict: Created report with ID
    """
    # TODO: Implement
    pass


def get_reports_by_lot(lot_id: str, limit: int = 50) -> list:
    """
    Get reports for a specific parking lot.
    
    Args:
        lot_id: The parking lot ID
        limit: Maximum results
        
    Returns:
        list: List of reports
    """
    # TODO: Implement
    pass


def get_recent_reports(limit: int = 50) -> list:
    """
    Get recent reports across all lots.
    
    Args:
        limit: Maximum results
        
    Returns:
        list: List of recent reports
    """
    # TODO: Implement
    pass


# ============================================================================
# Real-time Updates
# ============================================================================

def subscribe_to_parking_updates(callback):
    """
    Subscribe to real-time parking lot updates.
    
    Args:
        callback: Function to call when updates occur
        
    Returns:
        function: Unsubscribe function
    """
    # TODO: Implement
    # db = get_db()
    # def on_snapshot(doc_snapshot, changes, read_time):
    #     for doc in doc_snapshot:
    #         callback(doc.to_dict())
    # return db.collection('parking_lots').on_snapshot(on_snapshot)
    pass


def subscribe_to_reports_updates(callback):
    """
    Subscribe to real-time report updates.
    
    Args:
        callback: Function to call when new reports arrive
        
    Returns:
        function: Unsubscribe function
    """
    # TODO: Implement
    pass


# ============================================================================
# Geospatial Queries
# ============================================================================

def get_nearby_parking_lots(
    latitude: float,
    longitude: float,
    radius_km: float = 1.0,
) -> list:
    """
    Get parking lots near a location using geospatial query.
    
    Note: Firestore doesn't support native geospatial queries.
    Alternative approaches:
    1. Use Geohash-based indexing
    2. Use third-party service like Algolia
    3. Client-side filtering (not recommended for large datasets)
    
    Args:
        latitude: Center latitude
        longitude: Center longitude
        radius_km: Search radius in kilometers
        
    Returns:
        list: Nearby parking lots
    """
    # TODO: Implement using geohash or alternative
    pass


# ============================================================================
# User Management
# ============================================================================

def create_user(user_id: str, user_data: dict) -> dict:
    """
    Create or update a user profile.
    
    Args:
        user_id: User's unique ID (from auth)
        user_data: User profile data
        
    Returns:
        dict: Created/updated user data
    """
    # TODO: Implement
    pass


def get_user(user_id: str) -> Optional[dict]:
    """
    Get user profile by ID.
    
    Args:
        user_id: User's unique ID
        
    Returns:
        dict or None: User data if found
    """
    # TODO: Implement
    pass


def add_favorite(user_id: str, lot_id: str) -> dict:
    """
    Add a parking lot to user's favorites.
    
    Args:
        user_id: User's unique ID
        lot_id: Parking lot ID
        
    Returns:
        dict: Updated user data
    """
    # TODO: Implement
    pass


def remove_favorite(user_id: str, lot_id: str) -> dict:
    """
    Remove a parking lot from user's favorites.
    
    Args:
        user_id: User's unique ID
        lot_id: Parking lot ID
        
    Returns:
        dict: Updated user data
    """
    # TODO: Implement
    pass


def add_to_history(user_id: str, lot_id: str, action: str) -> dict:
    """
    Add an action to user's parking history.
    
    Args:
        user_id: User's unique ID
        lot_id: Parking lot ID
        action: Action type (parked/searched)
        
    Returns:
        dict: Created history entry
    """
    # TODO: Implement
    pass


def get_user_history(user_id: str, limit: int = 20) -> list:
    """
    Get user's parking history.
    
    Args:
        user_id: User's unique ID
        limit: Maximum results
        
    Returns:
        list: User's parking history
    """
    # TODO: Implement
    pass


# ============================================================================
# Initialization
# ============================================================================

if __name__ == "__main__":
    # Test Firebase connection
    print("Testing Firebase connection...")
    initialize_firebase()
    print("Firebase module ready")