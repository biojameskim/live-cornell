const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Helper to load env vars from .env.local
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf-8');
            envConfig.split('\n').forEach((line) => {
                const [key, value] = line.split('=');
                if (key && value) {
                    process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
                }
            });
        }
    } catch (e) {
        console.error("Error loading .env.local:", e);
    }
}

loadEnv();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("DATABASE_URL not found in .env.local. Cannot run migration.");
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // Supabase requires SSL
});

const sql = `
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  unique(listing_id, user_id)
);

alter table reviews enable row level security;

do $$ begin
  drop policy if exists "Reviews are viewable by everyone" on reviews;
  create policy "Reviews are viewable by everyone"
    on reviews for select
    using ( true );
exception when others then null; end $$;

do $$ begin
  drop policy if exists "Authenticated users can create reviews" on reviews;
  create policy "Authenticated users can create reviews"
    on reviews for insert
    with check ( auth.role() = 'authenticated' and auth.uid() = user_id );
exception when others then null; end $$;

do $$ begin
  drop policy if exists "Users can update their own reviews" on reviews;
  create policy "Users can update their own reviews"
    on reviews for update
    using ( auth.uid() = user_id );
exception when others then null; end $$;

do $$ begin
  drop policy if exists "Users can delete their own reviews" on reviews;
  create policy "Users can delete their own reviews"
    on reviews for delete
    using ( auth.uid() = user_id );
exception when others then null; end $$;
`;

async function run() {
    try {
        await client.connect();
        console.log("Connected to database.");
        await client.query(sql);
        console.log("Migration completed successfully.");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await client.end();
    }
}

run();
