from typing import List
from .base import Listing
from .single_building import SingleBuildingScraper

class CityCentreScraper(SingleBuildingScraper):
    def __init__(self):
        super().__init__(
            title="City Centre Ithaca",
            url="https://citycentreithaca.com/",
            address="301 E State St, Ithaca, NY 14850",
            description="Luxury apartments in downtown Ithaca. Pet friendly, fitness center, roof terrace.",
            photos=[
                "https://citycentreithaca.com/wp-content/uploads/2019/06/City-Centre-Ithaca-Exterior-1.jpg" # Hypothetical, or we can fetch homepage to get one
            ]
        )
        # We could override scrape() to fetch the homepage and get a real photo
