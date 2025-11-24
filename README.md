# Live Cornell

A centralized housing platform for the Cornell University community in Ithaca, NY. This application aggregates official listings and student sublets, providing Ithaca-specific insights like heating costs, elevation warnings, and TCAT bus route proximity.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth)
- **Data Pipeline**: Python (BeautifulSoup)

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- Supabase Account (optional for mock mode)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cornell-housing.git
   cd cornell-housing
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup Environment Variables:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *Note: If these are missing, the app will fallback to mock data for listings.*

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Data Pipeline (Scraper)

To generate mock data or run the scraper:

1. Install Python dependencies:
   ```bash
   pip install -r scripts/requirements.txt
   ```

2. Run the scraper:
   ```bash
   python3 scripts/scrape.py
   ```
   This will output JSON to stdout and save to `scripts/mock_listings.json`.

3. To use this data in the app (if not using DB), copy it to `src/data`:
   ```bash
   cp scripts/mock_listings.json src/data/mock_listings.json
   ```

## Database Setup (Supabase)

1. Go to the SQL Editor in your Supabase dashboard.
2. Run the contents of `supabase/schema.sql`.
3. This will create the `listings` and `reports` tables with appropriate RLS policies.

## Features & Ithaca Logic

- **Elevation Warnings**: Automatically flags listings in "Fall Creek" as having a steep uphill walk to campus.
- **Heating Cost Estimates**: Infers heating type (Electric Baseboard vs Gas/Steam) from descriptions to warn about potential high winter costs.
- **TCAT Integration**: Infers nearest bus routes (10, 30, 81) based on street address.

## Future Improvements

- Real Google Maps API integration (currently mocked).
- Image upload for sublets (requires Supabase Storage).
- User profiles and dashboard.
- Live scraping of real property management sites (currently using mock HTML).
