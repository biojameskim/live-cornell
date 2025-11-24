import requests
from bs4 import BeautifulSoup
from typing import List, Optional
import re
import time
from .base import BaseScraper, Listing

class UrbanIthacaScraper(BaseScraper):
    BASE_URL = "https://www.urbanithaca.com"
    
    def scrape(self) -> List[Listing]:
        listings = []
        for path in ["/apartments", "/houses"]:
            url = self.BASE_URL + path
            print(f"Scraping {url}...")
            try:
                response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Find links to details
                # They look like /detailed-view-more/62/16/1
                links = set()
                for a in soup.find_all('a', href=True):
                    href = a['href']
                    if 'detailed-view-more' in href:
                        if not href.startswith('http'):
                            href = self.BASE_URL + href
                        links.add(href)
                
                print(f"  Found {len(links)} listings on {path}")
                
                for link in links:
                    time.sleep(0.5)
                    listing = self.scrape_details(link)
                    if listing:
                        listings.append(listing)
                        
            except Exception as e:
                print(f"Error scraping {url}: {e}")
        return listings

    def scrape_details(self, url: str) -> Optional[Listing]:
        try:
            response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
            if response.status_code != 200:
                return None
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Title
            title_elem = soup.find('h1') or soup.find('h2')
            title = title_elem.text.strip() if title_elem else "Unknown Property"
            
            # Address
            # Look for address in text
            address = "Ithaca, NY"
            addr_match = soup.find(string=re.compile(r"\d+\s+[\w\s]+,\s*Ithaca", re.IGNORECASE))
            if addr_match:
                address = addr_match.strip()
            
            # Rent
            rent = 0
            price_text = soup.find(string=re.compile(r"\$[\d,]+"))
            if price_text:
                match = re.search(r"\$([\d,]+)", price_text)
                if match:
                    rent = int(match.group(1).replace(',', ''))
            
            # Bedrooms
            bedrooms = 1
            bd_match = re.search(r"(\d+)\s*Bedroom", soup.get_text(), re.IGNORECASE)
            if bd_match:
                bedrooms = int(bd_match.group(1))
            elif "Studio" in title or "Studio" in soup.get_text():
                bedrooms = 0
                
            # Description
            description = ""
            desc_div = soup.find('div', class_='description') # Guessing
            if desc_div:
                description = desc_div.text.strip()
            
            # Photos
            photos = []
            for img in soup.find_all('img'):
                src = img.get('src')
                if src and 'uploads' in src:
                    if not src.startswith('http'):
                        src = self.BASE_URL + src
                    photos.append(src)
            
            neighborhood = self.infer_neighborhood(address)
            
            return Listing(
                title=title,
                address=address,
                rent=rent,
                bedrooms=bedrooms,
                bathrooms=1.0,
                neighborhood=neighborhood,
                lease_term="12-month",
                heating_type="Unknown",
                description=description,
                url=url,
                nearest_tcat_route=self.infer_tcat_route(address),
                elevation_warning=self.infer_elevation_warning(neighborhood),
                photos=photos[:5]
            )
            
        except Exception as e:
            # print(f"Error scraping details {url}: {e}")
            return None
