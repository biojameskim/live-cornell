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

### Official Listings Scraper

The platform includes production-ready scrapers for 11+ Ithaca property management websites:

1. Install Python dependencies:
   ```bash
   pip install -r scripts/requirements.txt
   ```

2. Run the scrapers to collect listings:
   ```bash
   python scripts/run_scrapers.py
   ```
   This generates `scripts/data/scraped_listings.json` with real data from live websites.

3. Seed the database with scraped listings:
   ```bash
   npx tsx scripts/seed_scraped.ts
   ```
   This will upsert listings and automatically remove stale ones.

**Supported Sites**: Ithaca Renting, Travis Hyde Properties, City Centre, Lux & Lofts, Urban Ithaca, Lambrou Real Estate, and more.

**Maintenance**: Run the scraper + seed script weekly to keep listings fresh. The system automatically removes listings that are no longer available.

## Database Setup (Supabase)

1. Go to the SQL Editor in your Supabase dashboard.
2. Run the contents of `supabase/schema.sql`.
3. This will create the `listings` and `reports` tables with appropriate RLS policies.

## Features & Ithaca Logic

- **Elevation Warnings**: Automatically flags listings in "Fall Creek" as having a steep uphill walk to campus.
- **Heating Cost Estimates**: Infers heating type (Electric Baseboard vs Gas/Steam) from descriptions to warn about potential high winter costs.
- **TCAT Integration**: Infers nearest bus routes (10, 30, 81) based on street address.

## Contributing

We welcome contributions from the Cornell community! Whether you're fixing bugs, adding features, or improving documentation, your help makes this platform better for everyone.

### How to Contribute

1. **Fork the repository** and create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and ensure they follow the existing code style.

3. **Test your changes** locally:
   ```bash
   npm run dev
   ```

4. **Commit your changes** with clear, descriptive messages:
   ```bash
   git commit -m "Add: brief description of your changes"
   ```

5. **Push to your fork** and submit a pull request:
   ```bash
   git push origin feature/your-feature-name
   ```

### Questions?

Open an issue or feel free to reach out . We're here to help!

## Future Improvements (Contribution Ideas)

- **Automated Scraping**: Set up cron jobs or GitHub Actions to run scrapers automatically
- **Enhanced Messaging**: Direct messaging between users and hosts
- **Mobile App**: React Native version for iOS/Android
- **Advanced Filters**: Commute time calculator, pet-friendly search, furnished options
- **Reviews & Ratings**: Community feedback on landlords and properties
