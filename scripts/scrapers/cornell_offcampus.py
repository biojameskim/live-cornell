import requests
from bs4 import BeautifulSoup
from typing import List, Optional
import re
import time
from .base import BaseScraper, Listing

class CornellOffCampusScraper(BaseScraper):
    BASE_URL = "https://listings.offcampusliving.cornell.edu"
    START_URL = "https://listings.offcampusliving.cornell.edu/listings?search=&priceMin=500&priceMax=3900&bedroom=10&pets=any&likes=false&view=list&safety=false"

    def scrape(self) -> List[Listing]:
        listings = []
        current_url = self.START_URL
        page_count = 0
        
        print(f"Starting scrape of Cornell Off-Campus Living...")

        while current_url and page_count < 20: # Safety limit
            page_count += 1
            print(f"  Scraping page {page_count}...")
            
            try:
                response = requests.get(current_url, headers={'User-Agent': 'Mozilla/5.0'})
                if response.status_code != 200:
                    print(f"  Failed to load page {current_url}: {response.status_code}")
                    break
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Find listing cards
                # Based on inspection, they seem to be in a list
                # We'll look for elements that look like listing containers
                
                # Common pattern in these sites: div with class 'listing' or similar
                # Let's try to find all divs that contain a link to /listings/view/
                
                listing_cards = []
                for a in soup.find_all('a', href=True):
                    if '/listings/view/' in a['href']:
                        # This link is likely the "View" button or title
                        # We need the container card. 
                        # Usually the card is a parent or ancestor.
                        # Let's assume the card is the closest div with some content
                        card = a.find_parent('div', class_=lambda x: x and 'listing' in x if x else False)
                        if not card:
                            # Fallback: just use the parent container if it looks substantial
                            card = a.find_parent('div', style=False) # simplistic
                        
                        if card and card not in listing_cards:
                            listing_cards.append(card)
                
                # If we can't find cards by class, let's just iterate over the links and visit details pages?
                # That might be too slow. Let's try to extract from the list view first.
                
                # Actually, let's try a more robust selector.
                # Looking at standard rental sites, usually there's a main container.
                # Let's find all elements with class containing 'listing-result' or similar if possible.
                # Since I can't inspect live, I'll rely on finding the links and extracting info from the card text.
                
                # Better approach: Find all 'div's that contain the text "Bedrooms" or "Rent"
                potential_cards = soup.find_all('div', class_=lambda x: x and ('listing' in x or 'property' in x) if x else False)
                
                # If that fails, let's just grab all links to details pages and scrape them?
                # No, let's try to get what we can from the list page.
                
                # Let's iterate over all links to /listings/view/
                seen_urls = set()
                
                for a in soup.find_all('a', href=True):
                    href = a['href']
                    if '/listings/view/' in href:
                        full_url = self.BASE_URL + href
                        if full_url in seen_urls:
                            continue
                        seen_urls.add(full_url)
                        
                        # Now try to find the card context for this link
                        # The link is usually the title or "View Listing" button
                        card = a.find_parent('div', class_='listing') # Guessing class name
                        if not card:
                             card = a.find_parent('div', class_='row') # Bootstrap?
                        
                        if not card:
                            # If we can't find a card, we might have to skip or just use the URL
                            # Let's try to scrape the details page directly for better data
                            # It's slower but more reliable if we don't know the list DOM
                            # Given the user wants "all listings", accuracy is good.
                            # But 150 listings * 1 request each = 150 requests. That's fine.
                            pass

                # Let's actually just scrape the list of URLs from the page and visit them.
                # It's safer.
                
                page_links = set()
                for a in soup.find_all('a', href=True):
                    if '/listings/view/' in a['href']:
                        page_links.add(self.BASE_URL + a['href'])
                
                print(f"    Found {len(page_links)} listings on this page.")
                
                for url in page_links:
                    listing = self.scrape_details(url)
                    if listing:
                        listings.append(listing)
                        print(f"    Scraped: {listing.title}")
                    time.sleep(0.5) # Be nice
                
                # Find next page
                # Look for a link with text "Next" or "Next page" or class "next"
                next_link = soup.find('a', string=re.compile(r'Next', re.IGNORECASE))
                if not next_link:
                    next_link = soup.find('a', class_='next')
                
                if next_link and next_link.get('href'):
                    next_href = next_link['href']
                    if next_href.startswith('http'):
                        current_url = next_href
                    else:
                        current_url = self.BASE_URL + next_href
                else:
                    print("  No next page found. Finishing.")
                    current_url = None
                    
            except Exception as e:
                print(f"  Error on page {page_count}: {e}")
                break
                
        return listings

    def scrape_details(self, url: str) -> Optional[Listing]:
        try:
            response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
            if response.status_code != 200:
                return None
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Title
            title = "Unknown Property"
            h1 = soup.find('h1')
            if h1:
                title = h1.text.strip()
            
            # Address
            # Usually near the title
            address = "Ithaca, NY"
            # Look for address pattern or map link
            # Let's try to find a map link, usually has the address
            map_link = soup.find('a', href=re.compile(r'maps\.google\.com'))
            if map_link:
                # Extract address from query param or text
                address = map_link.text.strip()
            else:
                # Try to find text that looks like an address
                # Or just use the title if it looks like an address
                if any(char.isdigit() for char in title):
                    address = title + ", Ithaca, NY"

            # Rent
            rent = 0
            # Look for text like "$1,200"
            price_elem = soup.find(string=re.compile(r'\$[\d,]+'))
            if price_elem:
                match = re.search(r'\$([\d,]+)', price_elem)
                if match:
                    rent = int(match.group(1).replace(',', ''))
            
            # Bedrooms
            bedrooms = 1
            bed_text = soup.find(string=re.compile(r'Bedroom|Bdrm', re.IGNORECASE))
            if bed_text:
                # Try to find the number before it
                # e.g. "3 Bedrooms"
                parent = bed_text.parent
                full_text = parent.text.strip()
                match = re.search(r'(\d+)\s*(?:Bedroom|Bdrm)', full_text, re.IGNORECASE)
                if match:
                    bedrooms = int(match.group(1))
            
            # Bathrooms
            bathrooms = 1.0
            bath_text = soup.find(string=re.compile(r'Bathroom|Bath', re.IGNORECASE))
            if bath_text:
                parent = bath_text.parent
                full_text = parent.text.strip()
                match = re.search(r'(\d+(?:\.\d+)?)\s*(?:Bathroom|Bath)', full_text, re.IGNORECASE)
                if match:
                    bathrooms = float(match.group(1))

            # Description
            description = ""
            # Look for a paragraph with substantial text
            # Or a div with class 'description'
            desc_div = soup.find('div', class_=re.compile(r'description|details', re.IGNORECASE))
            if desc_div:
                description = desc_div.text.strip()
            else:
                # Fallback: find all paragraphs and join them
                ps = soup.find_all('p')
                description = "\n".join([p.text.strip() for p in ps if len(p.text.strip()) > 50])

            # Photos
            photos = []
            for img in soup.find_all('img'):
                src = img.get('src')
                if src and 'http' in src and ('listing' in src or 'upload' in src):
                    photos.append(src)
            
            # Normalize
            neighborhood = self.infer_neighborhood(address)
            
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
                photos=photos[:5]
            )

        except Exception as e:
            print(f"Error scraping details {url}: {e}")
            return None
