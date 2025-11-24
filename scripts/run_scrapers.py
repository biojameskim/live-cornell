import json
import os
import sys
from typing import List

# Add the current directory to path so we can import scrapers
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from scrapers.base import Listing
from scrapers.ithaca_renting import IthacaRentingScraper
from scrapers.travis_hyde import TravisHydeScraper
from scrapers.city_centre import CityCentreScraper
from scrapers.simple_sites import LuxAndLoftsScraper, TheIthacanScraper, IvyAndBearScraper, CollegetownCrossingScraper
from scrapers.urban_ithaca import UrbanIthacaScraper
from scrapers.demos_johnny import DemosJohnnyScraper
from scrapers.lambrou import LambrouScraper
from scrapers.collegetown_terrace import CollegetownTerraceScraper

def run_all_scrapers():
    all_listings: List[Listing] = []
    
    scrapers = [
        ("Ithaca Renting", IthacaRentingScraper()),
        ("Travis Hyde", TravisHydeScraper()),
        ("City Centre", CityCentreScraper()),
        ("Lux and Lofts", LuxAndLoftsScraper()),
        ("The Ithacan", TheIthacanScraper()),
        ("Ivy and Bear", IvyAndBearScraper()),
        ("Collegetown Crossing", CollegetownCrossingScraper()),
        ("Urban Ithaca", UrbanIthacaScraper()),
        ("Demos Johnny", DemosJohnnyScraper()),
        ("Lambrou Real Estate", LambrouScraper()),
        ("Collegetown Terrace", CollegetownTerraceScraper())
    ]

    for name, scraper in scrapers:
        print(f"\nRunning {name} Scraper...")
        try:
            listings = scraper.scrape()
            print(f"  Found {len(listings)} listings")
            all_listings.extend(listings)
        except Exception as e:
            print(f"  {name} failed: {e}")
    
    # Convert to dicts
    
    # Convert to dicts
    data = [vars(l) for l in all_listings]
    
    print(f"\nTotal listings scraped: {len(data)}")
    # print(json.dumps(data, indent=2))
    
    # Save to file for now
    os.makedirs('scripts/data', exist_ok=True)
    with open('scripts/data/scraped_listings.json', 'w') as f:
        json.dump(data, f, indent=2)

if __name__ == "__main__":
    run_all_scrapers()
