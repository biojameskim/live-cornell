import json
import re
from bs4 import BeautifulSoup
from datetime import datetime, timezone

# Mock HTML content simulating a property management site
MOCK_HTML = """
<html>
<body>
    <div class="listing">
        <h2 class="title">Sunny Studio on Stewart Ave</h2>
        <p class="address">408 Stewart Ave, Ithaca, NY 14850</p>
        <p class="price">$1200 / month</p>
        <p class="details">1 Bed | 1 Bath</p>
        <p class="description">Beautiful studio with lake views. Rent includes heat. Steam heat system. Close to campus.</p>
    </div>
    <div class="listing">
        <h2 class="title">Modern 2BR in Collegetown</h2>
        <p class="address">210 Dryden Rd, Ithaca, NY 14850</p>
        <p class="price">$1800 / month</p>
        <p class="details">2 Bed | 1 Bath</p>
        <p class="description">Newly renovated. Electric baseboard heating. Tenant pays electric. Steps from tea shops.</p>
    </div>
    <div class="listing">
        <h2 class="title">Cozy 3BR House</h2>
        <p class="address">312 College Ave, Ithaca, NY 14850</p>
        <p class="price">$2400 / month</p>
        <p class="details">3 Bed | 1.5 Bath</p>
        <p class="description">Great location. Gas heat included. Spacious living room.</p>
    </div>
    <div class="listing">
        <h2 class="title">Quiet Heights Apartment</h2>
        <p class="address">100 Highland Ave, Ithaca, NY 14850</p>
        <p class="price">$1500 / month</p>
        <p class="details">2 Bed | 1 Bath</p>
        <p class="description">Peaceful location in Cayuga Heights. Gas heating. Bus stop nearby.</p>
    </div>
    <div class="listing">
        <h2 class="title">North Campus Gem</h2>
        <p class="address">402 Thurston Ave, Ithaca, NY 14850</p>
        <p class="price">$1600 / month</p>
        <p class="details">2 Bed | 1 Bath</p>
        <p class="description">Close to architecture school. Radiator heat. 10-month lease available.</p>
    </div>
</body>
</html>
"""

def parse_heating_source(description: str) -> str:
    desc_lower = description.lower()
    if re.search(r"baseboard|electric heat", desc_lower):
        return "Electric Baseboard"
    elif re.search(r"gas", desc_lower):
        return "Gas"
    elif re.search(r"radiator|steam", desc_lower):
        return "Steam"
    return "Unknown"

def infer_tcat_route(address: str) -> str:
    addr_lower = address.lower()
    if "stewart" in addr_lower or "college" in addr_lower:
        return "Route 30"
    elif "dryden" in addr_lower or "linden" in addr_lower:
        return "Route 10"
    elif "university" in addr_lower or "thurston" in addr_lower or "highland" in addr_lower:
        return "Route 81"
    return "Unknown"

def infer_neighborhood(address: str) -> str:
    addr_lower = address.lower()
    if "college" in addr_lower or "dryden" in addr_lower:
        return "Collegetown"
    elif "stewart" in addr_lower or "buffalo" in addr_lower:
        return "Fall Creek" # Stewart is often considered lower Fall Creek or East Hill, but for this logic we'll map it
    elif "highland" in addr_lower or "thurston" in addr_lower:
        return "Lansing" # Or Cayuga Heights, mapping to Lansing for enum simplicity if needed, or maybe Fall Creek/North Campus
    # Adjusting based on enum: 'Collegetown', 'Fall Creek', 'Downtown', 'Varna', 'Lansing'
    # 408 Stewart -> Fall Creek (or close enough)
    # 100 Highland -> Lansing (Cayuga Heights is north)
    # 402 Thurston -> Fall Creek (North Campus)
    
    if "stewart" in addr_lower: return "Fall Creek"
    if "thurston" in addr_lower: return "Fall Creek"
    if "highland" in addr_lower: return "Lansing"
    
    return "Downtown"

def infer_elevation_warning(neighborhood: str) -> bool:
    return neighborhood == "Fall Creek"

def parse_listings():
    soup = BeautifulSoup(MOCK_HTML, 'html.parser')
    listings = []
    
    # Hardcoded coordinates for the 5 addresses to ensure map works
    coords = {
        "408 Stewart Ave": (42.442, -76.488),
        "210 Dryden Rd": (42.441, -76.484),
        "312 College Ave": (42.440, -76.485),
        "100 Highland Ave": (42.452, -76.488),
        "402 Thurston Ave": (42.450, -76.485)
    }

    listing_divs = soup.find_all('div', class_='listing')
    
    for div in listing_divs:
        title = div.find('h2', class_='title').text
        address = div.find('p', class_='address').text.split(',')[0].strip() # Just street address
        price_str = div.find('p', class_='price').text
        rent = int(re.sub(r'[^\d]', '', price_str))
        
        details = div.find('p', class_='details').text
        # "1 Bed | 1 Bath"
        parts = details.split('|')
        bedrooms = int(parts[0].strip().split()[0])
        bathrooms = float(parts[1].strip().split()[0]) # Could be 1.5
        
        description = div.find('p', class_='description').text
        
        neighborhood = infer_neighborhood(address)
        heating = parse_heating_source(description)
        tcat = infer_tcat_route(address)
        elevation = infer_elevation_warning(neighborhood)
        
        lat, lon = coords.get(address, (42.444, -76.501)) # Default to Ithaca Commons
        
        listing = {
            "title": title,
            "address": address,
            "latitude": lat,
            "longitude": lon,
            "rent": rent,
            "bedrooms": bedrooms,
            "bathrooms": int(bathrooms), # Schema says integer
            "neighborhood": neighborhood,
            "lease_term": "12-month", # Default
            "heating_type": heating,
            "nearest_tcat_route": tcat,
            "elevation_warning": elevation,
            "distance_from_campus_miles": 0.5, # Mocked
            "is_official_listing": True,
            "url": "https://example.com",
            "description": description,
            "photos": [
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        listings.append(listing)
        
    return listings

if __name__ == "__main__":
    data = parse_listings()
    print(json.dumps(data, indent=2))
    
    # Save to file
    with open('scripts/mock_listings.json', 'w') as f:
        json.dump(data, f, indent=2)
