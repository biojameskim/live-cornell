import requests
from bs4 import BeautifulSoup
from typing import List, Optional
import re
import time
from .base import BaseScraper, Listing

class IthacaRentingScraper(BaseScraper):
    BASE_URL = "https://ithacarenting.com"
    
    def scrape(self) -> List[Listing]:
        listings = []
        # Scrape both Collegetown and Downtown
        for path in ["/collegetown/", "/downtown/"]:
            url = self.BASE_URL + path
            print(f"Scraping {url}...")
            try:
                response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Find all listing blocks
                # Based on inspection: class="rmwb_header-section" contains the header and link
                # But we probably want the container that wraps this and maybe more info?
                # Actually, the link is enough to get details.
                
                # The inspection showed:
                # <div class="rmwb_header-section ...">
                #   <div class="detail-button">
                #     <p class="detail-arrow" href="...">
                
                # Let's find all elements with href containing 'unit-details'
                # Note: The href was on a <p> tag in the inspection output? 
                # Let's double check if it's an <a> tag or if the inspection output was misleading.
                # Usually href is on <a>. If it's on <p>, it might be JS handled.
                # But let's look for any tag with href containing unit-details
                
                links = soup.find_all(attrs={"href": re.compile(r"unit-details/\?uid=")})
                
                seen_urls = set()
                
                for link in links:
                    detail_url = link['href']
                    if not detail_url.startswith('http'):
                        detail_url = self.BASE_URL + detail_url
                    
                    if detail_url in seen_urls:
                        continue
                    seen_urls.add(detail_url)
                    
                    print(f"  Found listing: {detail_url}")
                    time.sleep(1) # Be nice to the server
                    listing = self.scrape_details(detail_url)
                    if listing:
                        listings.append(listing)
                        
            except Exception as e:
                print(f"Error scraping {url}: {e}")
                
        return listings

    def scrape_details(self, url: str) -> Optional[Listing]:
        try:
            response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
            if response.status_code != 200:
                print(f"  Failed to fetch details: {response.status_code}")
                return None
                
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Title
            # Usually in a header
            title_elem = soup.find('h1') or soup.find('h2', class_='entry-title')
            title = title_elem.text.strip() if title_elem else "Unknown Title"
            
            # Address
            # Often in a specific class or just text. 
            # We might need to inspect the details page structure too.
            # For now, let's try to find address-like text or a specific container.
            # A common pattern is <p class="address"> or similar.
            # If not found, we might fallback to "Ithaca, NY" and rely on title.
            
            address = "Ithaca, NY" # Default
            # Try to find address in text
            # Look for zip code 14850
            address_match = soup.find(string=re.compile(r"14850"))
            if address_match:
                address = address_match.strip()
            
            # Rent
            # Look for price text
            rent = 0
            price_text = soup.find(string=re.compile(r"\$[\d,]+"))
            if price_text:
                # Extract first number
                match = re.search(r"\$([\d,]+)", price_text)
                if match:
                    rent = int(match.group(1).replace(',', ''))
            
            # Bedrooms/Bathrooms
            # Look for text like "1 Bedroom" "2 Bath"
            bedrooms = 1
            bathrooms = 1.0
            
            text_content = soup.get_text()
            bd_match = re.search(r"(\d+)\s*Bed", text_content, re.IGNORECASE)
            if bd_match:
                bedrooms = int(bd_match.group(1))
            
            ba_match = re.search(r"(\d+\.?\d*)\s*Bath", text_content, re.IGNORECASE)
            if ba_match:
                bathrooms = float(ba_match.group(1))
                
            # Description
            description_elem = soup.find('div', class_='entry-content') or soup.find('div', class_='description')
            description = description_elem.text.strip() if description_elem else ""
            
            # Photos
            photos = []
            for img in soup.find_all('img'):
                src = img.get('src')
                if src and 'uploads' in src and not src.endswith('svg'):
                    photos.append(src)
            
            # Normalize
            neighborhood = self.infer_neighborhood(address)
            if "collegetown" in url:
                neighborhood = "Collegetown"
            elif "downtown" in url:
                neighborhood = "Downtown"
                
            return Listing(
                title=title,
                address=address,
                rent=rent,
                bedrooms=bedrooms,
                bathrooms=bathrooms,
                neighborhood=neighborhood,
                lease_term="12-month", # Default
                heating_type=self.parse_heating_source(description),
                description=description,
                url=url,
                nearest_tcat_route=self.infer_tcat_route(address),
                elevation_warning=self.infer_elevation_warning(neighborhood),
                photos=photos[:5] # Limit to 5
            )
            
        except Exception as e:
            print(f"  Error scraping details {url}: {e}")
            return None
