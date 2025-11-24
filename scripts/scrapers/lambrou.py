import requests
from bs4 import BeautifulSoup
from typing import List, Optional
import re
import time
from .base import BaseScraper, Listing

class LambrouScraper(BaseScraper):
    BASE_URL = "https://www.lambrourealestate.com"
    
    def scrape(self) -> List[Listing]:
        listings = []
        # Lambrou lists properties directly on the page or subpages
        # The chunk showed links like "103 Eddy Street (5 Bed)"
        
        url = self.BASE_URL + "/neighborhood" # Or just check the homepage/sitemap
        # Actually the chunk showed links on /neighborhood page? No, it showed links in the chunk.
        # Let's try scraping the homepage or a known list page.
        # The chunk showed [All](https://www.lambrourealestate.com/houses)
        
        for path in ["/houses", "/apartments"]:
            url = self.BASE_URL + path
            print(f"Scraping {url}...")
            try:
                response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                
                links = set()
                for a in soup.find_all('a', href=True):
                    href = a['href']
                    text = a.text.strip()
                    # Check if it looks like an address or has "Bed"
                    if re.search(r"\d+.*(St|Ave|Rd|Place|Lane)", text, re.IGNORECASE) or "Bed" in text:
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
            
            title_elem = soup.find('h1') or soup.find('h2')
            title = title_elem.text.strip() if title_elem else "Unknown Property"
            
            # Address is usually the title for Lambrou
            address = title + ", Ithaca, NY"
            
            # Rent
            rent = 0
            price_text = soup.find(string=re.compile(r"\$[\d,]+"))
            if price_text:
                match = re.search(r"\$([\d,]+)", price_text)
                if match:
                    rent = int(match.group(1).replace(',', ''))
            
            # Bedrooms
            bedrooms = 1
            bd_match = re.search(r"(\d+)\s*Bed", title, re.IGNORECASE)
            if bd_match:
                bedrooms = int(bd_match.group(1))
            
            description = ""
            desc_div = soup.find('div', class_='sqs-block-content')
            if desc_div:
                description = desc_div.text.strip()
            
            photos = []
            for img in soup.find_all('img'):
                src = img.get('src') or img.get('data-src')
                if src and 'http' in src:
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
            return None
