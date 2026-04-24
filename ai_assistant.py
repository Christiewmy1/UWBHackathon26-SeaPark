"""
SeaPark AI Assistant
RAG-based parking recommendation assistant
"""

import os
from supabase import create_client
from openai import OpenAI

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "YOUR_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "YOUR_SUPABASE_ANON_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "YOUR_OPENAI_API_KEY")


def search_parking_spots(client, query, limit=5):
    """
    Search parking spots by finding closest/cheapest matches.
    
    For simplicity, returns all spots - in production you'd use
    PostGIS for geographic search or full-text search for keywords.
    """
    response = client.table("parking_spots").select("*").execute()
    return response.data


def calculate_trust_score(client, spot_id):
    """Calculate trust score from user reports for a parking spot."""
    response = client.table("user_reports").select("*").eq("spot_id", spot_id).execute()
    reports = response.data
    
    if not reports:
        return None
    
    # Calculate average cleanliness
    cleanliness_scores = [r["cleanliness"] for r in reports if r.get("cleanliness")]
    avg_cleanliness = sum(cleanliness_scores) / len(cleanliness_scores) if cleanliness_scores else None
    
    # Count status distribution
    status_counts = {}
    for report in reports:
        status = report.get("status")
        status_counts[status] = status_counts.get(status, 0) + 1
    
    return {
        "avg_cleanliness": avg_cleanliness,
        "total_reports": len(reports),
        "status_distribution": status_counts
    }


def get_price_info(spot):
    """Extract price info from JSONB field."""
    price_info = spot.get("price_info", {})
    if isinstance(price_info, str):
        import json
        price_info = json.loads(price_info)
    return price_info


def rank_by_cheapest(spots):
    """Rank spots by price (cheapest first)."""
    ranked = []
    for spot in spots:
        price_info = get_price_info(spot)
        # Use hourly_rate or daily_max as primary price metric
        hourly = price_info.get("hourly_rate") if price_info else None
        daily = price_info.get("daily_max") if price_info else None
        
        # Normalize to hourly for comparison
        if hourly:
            price = hourly
        elif daily:
            price = daily / 8  # Estimate 8-hour day
        else:
            price = float('inf')
        
        ranked.append((price, spot))
    
    ranked.sort(key=lambda x: x[0])
    return [spot for _, spot in ranked]


def build_context_string(spots, client):
    """Build context string from parking spots for LLM."""
    context_parts = []
    
    for i, spot in enumerate(spots, 1):
        price_info = get_price_info(spot)
        
        # Get trust score if available
        trust = calculate_trust_score(client, spot["id"])
        trust_str = ""
        if trust and trust["avg_cleanliness"]:
            trust_str = f" | Trust Score: {trust['avg_cleanliness']:.1f}/5 ({trust['total_reports']} reports)"
        
        # Build price string
        price_parts = []
        if price_info.get("hourly_rate"):
            price_parts.append(f"${price_info['hourly_rate']}/hr")
        if price_info.get("daily_max"):
            price_parts.append(f"${price_info['daily_max']}/day")
        price_str = ", ".join(price_parts) if price_parts else "Contact for pricing"
        
        context_parts.append(
            f"{i}. {spot['name']} ({spot['type']}) - {price_str} | "
            f"Location: {spot['latitude']:.4f}, {spot['longitude']:.4f} | "
            f"Spots: {spot.get('total_spots', 'N/A')}{trust_str}"
        )
    
    return "\n".join(context_parts)


def generate_recommendation(client, user_query, context):
    """Generate AI recommendation using OpenAI."""
    client_openai = OpenAI(api_key=OPENAI_API_KEY)
    
    system_prompt = """You are SeaPark, a friendly AI assistant helping users find parking in Seattle. 
Based on the parking data provided, give a helpful, concise recommendation. 
Mention the name, price, and why you recommend it.
Keep responses under 3 sentences. Be friendly and practical."""

    response = client_openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"User question: {user_query}\n\nParking options:\n{context}"}
        ],
        temperature=0.7,
        max_tokens=200
    )
    
    return response.choices[0].message.content


def ask_parking_assistant(user_query):
    """
    Main function for the SeaPark AI Assistant.
    
    Args:
        user_query: User's question about parking (e.g., "Where is the cheapest parking near Pike Place?")
    
    Returns:
        str: AI-generated parking recommendation
    """
    # Initialize Supabase client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Search for parking spots
    all_spots = search_parking_spots(supabase, user_query)
    
    if not all_spots:
        return "Sorry, I couldn't find any parking spots in the database. Please try again later!"
    
    # Rank by cheapest (you could also add proximity logic with PostGIS)
    ranked_spots = rank_by_cheapest(all_spots)[:5]
    
    # Build context for LLM
    context = build_context_string(ranked_spots, supabase)
    
    # Generate recommendation
    recommendation = generate_recommendation(supabase, user_query, context)
    
    return recommendation


if __name__ == "__main__":
    # Example usage
    query = "Where is the cheapest parking near Pike Place?"
    result = ask_parking_assistant(query)
    print(f"User: {query}")
    print(f"SeaPark: {result}")