from .single_building import SingleBuildingScraper

class CollegetownTerraceScraper(SingleBuildingScraper):
    def __init__(self):
        super().__init__(
            title="Collegetown Terrace",
            url="https://collegetownterrace.com/",
            address="115 S Quarry St, Ithaca, NY 14850", # Main office/location
            description="Modern student apartments with shuttle service, gym, and more.",
            photos=["https://collegetownterrace.com/wp-content/uploads/2020/10/CTT-Exterior.jpg"]
        )
