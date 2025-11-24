import requests
from bs4 import BeautifulSoup
from typing import List, Optional
import re
from .base import BaseScraper, Listing

class TravisHydeScraper(BaseScraper):
    BASE_URL = "https://travishyde.com"
    LISTING_URL = "https://travishyde.com/residential-properties-ithaca-ny"
    
    def scrape(self) -> List[Listing]:
        listings = []
        print(f"Scraping {self.LISTING_URL}...")
        try:
            response = requests.get(self.LISTING_URL, headers={'User-Agent': 'Mozilla/5.0'})
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find property links
            # Based on markdown, they have "View More" links
            # Let's look for links to specific property pages
            
            # We can look for links that start with the base url and are not the listing url
            # Or look for specific classes.
            # Let's try to find all 'a' tags with 'View More' text or similar, or just inspect hrefs
            
            links = set()
            for a in soup.find_all('a', href=True):
                href = a['href']
                if not href.startswith('http'):
                    href = self.BASE_URL + href
                
                # Filter for property pages
                # They seem to be like https://travishyde.com/ravenwood
                # Let's exclude common pages
                if any(x in href for x in ['contact', 'about', 'floorplans', 'news', 'faq', 'privacy', 'terms', 'commercial']):
                    continue
                
                # Heuristic: URL path has 1 segment after domain (or few) and is not the listing page
                path = href.replace(self.BASE_URL, '')
                if path in ['/', '/home', '/residential-properties-ithaca-ny']:
                    continue
                
                # Check if it looks like a property page
                # Maybe check if it's listed in the main content area
                links.add(href)
            
            print(f"  Found {len(links)} potential property links")
            
            for url in links:
                # print(f"  Checking {url}...")
                listing = self.scrape_property(url)
                if listing:
                    print(f"  Found listing: {listing.title}")
                    listings.append(listing)
                    
        except Exception as e:
            print(f"Error scraping Travis Hyde: {e}")
            
        return listings

    def scrape_property(self, url: str) -> Optional[Listing]:
        try:
            response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
            if response.status_code != 200:
                return None
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Check if it's actually a property page
            # Look for "Apply Now" or "Amenities" or similar
            if not soup.find(string=re.compile(r"Apply Now|Amenities|Floor Plans", re.IGNORECASE)):
                return None
            
            title_elem = soup.find('h1')
            if title_elem:
                title = title_elem.text.strip()
            else:
                # Fallback to page title
                page_title = soup.title.string.strip() if soup.title else ""
                title = page_title.split('—')[0].replace('Residential -', '').strip()
            
            # Address
            # The address found in inspection was the office address.
            # We should try to find a specific address or just default to Ithaca.
            # Some pages might have it in a map block or text.
            address = "Ithaca, NY"
            # Try to find address in the text that is NOT the office address
            # This is hard without specific selectors.
            # For now, we'll stick to Ithaca, NY and let the user check the link.
            
            # Description
            desc_elem = soup.find('div', class_='sqs-block-content') # Squarespace class?
            description = desc_elem.text.strip() if desc_elem else ""
            
            # Rent
            # Might be a range or "Starting at"
            rent = 0
            price_text = soup.find(string=re.compile(r"\$[\d,]+"))
            if price_text:
                match = re.search(r"\$([\d,]+)", price_text)
                if match:
                    rent = int(match.group(1).replace(',', ''))
            
            # Photos
            photos = []
            for img in soup.find_all('img'):
                src = img.get('src') or img.get('data-src')
                if src and 'http' in src:
                    photos.append(src)
            
            # Normalize
            neighborhood = self.infer_neighborhood(address)
            
            return Listing(
                title=title,
                address=address,
                rent=rent,
                bedrooms=1, # Default
                bathrooms=1.0,
                neighborhood=neighborhood,
                lease_term="12-month",
                heating_type=self.parse_heating_source(description),
                description=description,
                url=url,
                nearest_tcat_route=self.infer_tcat_route(address),
                elevation_warning=self.infer_elevation_warning(neighborhood),
                photos=photos[:5]
            )
            
        except Exception as e:
            # print(f"  Error scraping details {url}: {e}")
            return None
