import requests
from bs4 import BeautifulSoup

def inspect(url, name):
    print(f"\n--- Inspecting {name} ({url}) ---")
    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'}
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        print("Page Title:", soup.title.string.strip())
        
        if name == "Travis Hyde Property":
            # Inspect title and address
            h1 = soup.find('h1')
            print("H1:", h1.text.strip() if h1 else "None")
            
            # Address?
            # Look for common address patterns
            import re
            addr = soup.find(string=re.compile(r"Ithaca, NY"))
            if addr:
                print("Found address candidate:", addr.strip())
                print("Parent:", addr.parent.name, addr.parent.get('class'))
            
            # Description
            desc = soup.find('div', class_='sqs-block-content')
            if desc:
                print("Found sqs-block-content (Description?):", desc.text.strip()[:100])

        elif name == "City Centre":
            # Look for floorplans link
            links = soup.find_all('a', href=True)
            for a in links:
                if 'floor' in a['href'].lower() or 'plan' in a['href'].lower():
                    print("Found floorplan link:", a['href'], a.text.strip())
            
            # Look for availability
            if soup.find(string=re.compile("Availability", re.IGNORECASE)):
                print("Found 'Availability' text")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect("https://travishyde.com/ravenwood", "Travis Hyde Property")
    inspect("https://citycentreithaca.com/", "City Centre")
