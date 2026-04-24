"""
SeaPark Data Fetcher
Fetches parking data from Seattle SODA API and syncs to Supabase
"""

import requests
from supabase import create_client

# Configuration - set these environment variables or update directly
SEATTLE_API_URL = "https://data.seattle.gov/resource/3qbw-quib.json"
SUPABASE_URL = "YOUR_SUPABASE_URL"
SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY"


def fetch_parking_data():
    """Fetch parking garage data from Seattle SODA API."""
    response = requests.get(SEATTLE_API_URL, timeout=30)
    response.raise_for_status()
    return response.json()


def parse_parking_spots(data):
    """Parse API response into parking spot records."""
    spots = []
    
    for record in data:
        # Extract coordinates (Seattle API uses location as GeoJSON point)
        location = record.get("location", {})
        coordinates = location.get("coordinates", [])
        
        # Handle both array [lon, lat] and separate lat/lon fields
        if len(coordinates) >= 2:
            longitude = coordinates[0]
            latitude = coordinates[1]
        else:
            latitude = record.get("latitude") or record.get("lat")
            longitude = record.get("longitude") or record.get("lon")
        
        if not latitude or not longitude:
            continue
        
        # Extract name
        name = record.get("name") or record.get("title") or record.get("garage_name")
        if not name:
            continue
        
        # Extract parking info
        total_spots = record.get("number_of_parking_spaces") or record.get("spaces")
        
        # Build price_info JSON
        price_info = {
            "hourly_rate": record.get("hourly_rate"),
            "daily_max": record.get("daily_maximum"),
            "evening_rate": record.get("evening_rate"),
            "weekend_rate": record.get("weekend_rate")
        }
        # Remove None values
        price_info = {k: v for k, v in price_info.items() if v is not None}
        
        spot = {
            "name": name,
            "latitude": float(latitude),
            "longitude": float(longitude),
            "type": "garage",
            "price_info": price_info,
            "total_spots": int(total_spots) if total_spots else None
        }
        spots.append(spot)
    
    return spots


def upsert_to_supabase(client, spots):
    """Upsert parking spots into Supabase."""
    response = client.table("parking_spots").upsert(
        spots,
        on_conflict="name",
        ignore_duplicates=True
    ).execute()
    return response


def main():
    # Initialize Supabase client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    print("Fetching parking data from Seattle API...")
    data = fetch_parking_data()
    print(f"Retrieved {len(data)} records from API")
    
    print("Parsing parking spots...")
    spots = parse_parking_spots(data)
    print(f"Parsed {len(spots)} valid parking spots")
    
    if spots:
        print("Upserting to Supabase...")
        result = upsert_to_supabase(supabase, spots)
        print(f"Successfully synced {len(spots)} parking spots!")
    else:
        print("No valid parking spots to upsert")


if __name__ == "__main__":
    main()