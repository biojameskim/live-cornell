import re
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime, timezone

@dataclass
class Listing:
    title: str
    address: str
    rent: int
    bedrooms: int
    bathrooms: float
    neighborhood: str
    lease_term: str
    heating_type: str
    description: str
    url: str
    latitude: float = 0.0
    longitude: float = 0.0
    nearest_tcat_route: Optional[str] = None
    elevation_warning: bool = False
    distance_from_campus_miles: Optional[float] = None
    is_official_listing: bool = True
    photos: List[str] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class BaseScraper(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def scrape(self) -> List[Listing]:
        """Scrape listings from the source."""
        pass

    def normalize_address(self, address: str) -> str:
        """Clean up address string."""
        return address.split(',')[0].strip()

    def infer_neighborhood(self, address: str) -> str:
        addr_lower = address.lower()
        if "college" in addr_lower or "dryden" in addr_lower:
            return "Collegetown"
        elif "stewart" in addr_lower or "buffalo" in addr_lower:
            return "Fall Creek"
        elif "highland" in addr_lower or "thurston" in addr_lower:
            return "Lansing" # Mapping based on previous logic
        
        if "stewart" in addr_lower: return "Fall Creek"
        if "thurston" in addr_lower: return "Fall Creek"
        if "highland" in addr_lower: return "Lansing"
        
        return "Downtown"

    def infer_tcat_route(self, address: str) -> str:
        addr_lower = address.lower()
        if "stewart" in addr_lower or "college" in addr_lower:
            return "Route 30"
        elif "dryden" in addr_lower or "linden" in addr_lower:
            return "Route 10"
        elif "university" in addr_lower or "thurston" in addr_lower or "highland" in addr_lower:
            return "Route 81"
        return "Unknown"

    def parse_heating_source(self, description: str) -> str:
        desc_lower = description.lower()
        if re.search(r"baseboard|electric heat", desc_lower):
            return "Electric Baseboard"
        elif re.search(r"gas", desc_lower):
            return "Gas"
        elif re.search(r"radiator|steam", desc_lower):
            return "Steam"
        return "Unknown"

    def infer_elevation_warning(self, neighborhood: str) -> bool:
        return neighborhood == "Fall Creek"
