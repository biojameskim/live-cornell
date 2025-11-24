from .single_building import SingleBuildingScraper

class LuxAndLoftsScraper(SingleBuildingScraper):
    def __init__(self):
        super().__init__(
            title="Lux and Lofts",
            url="https://www.luxandlofts.com/",
            address="114 Summit Ave, Ithaca, NY 14850", # Lux address
            description="Luxury student apartments in Collegetown. Three buildings, two communities.",
            photos=["https://www.luxandlofts.com/wp-content/uploads/2022/10/Lux-Exterior-1.jpg"]
        )

class TheIthacanScraper(SingleBuildingScraper):
    def __init__(self):
        super().__init__(
            title="The Ithacan",
            url="https://livetheithacan.com/",
            address="210 E State St, Ithaca, NY 14850",
            description="Modern living in the heart of downtown Ithaca.",
            photos=["https://livetheithacan.com/wp-content/uploads/2020/10/The-Ithacan-Exterior.jpg"]
        )

class IvyAndBearScraper(SingleBuildingScraper):
    def __init__(self):
        super().__init__(
            title="The Ivy and The Bear",
            url="https://www.theivyandthebear.com/",
            address="133 Dryden Rd, Ithaca, NY 14850", # The Ivy
            description="Boutique apartments in Collegetown.",
            photos=[]
        )

class CollegetownCrossingScraper(SingleBuildingScraper):
    def __init__(self):
        super().__init__(
            title="Collegetown Crossing",
            url="https://www.collegetowncrossing.com/",
            address="307 College Ave, Ithaca, NY 14850",
            description="Modern apartments in the heart of Collegetown.",
            photos=["https://www.collegetowncrossing.com/wp-content/uploads/2019/06/Collegetown-Crossing-Exterior.jpg"]
        )
