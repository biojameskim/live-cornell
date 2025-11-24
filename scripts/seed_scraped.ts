import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or ANON_KEY) are set in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function seed() {
    const dataPath = path.resolve(process.cwd(), 'scripts/data/scraped_listings.json');
    if (!fs.existsSync(dataPath)) {
        console.error("No scraped data found at scripts/data/scraped_listings.json");
        process.exit(1);
    }

    const listings = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log(`Found ${listings.length} listings to insert.`);

    let insertedCount = 0;
    let errorCount = 0;

    const runTimestamp = new Date().toISOString();

    for (const listing of listings) {
        // Upsert listing based on URL
        const { error } = await supabase
            .from('listings')
            .upsert({
                title: listing.title,
                address: listing.address,
                latitude: listing.latitude || 42.4440,
                longitude: listing.longitude || -76.5019,
                rent: listing.rent,
                bedrooms: listing.bedrooms,
                bathrooms: listing.bathrooms,
                neighborhood: listing.neighborhood,
                lease_term: listing.lease_term,
                heating_type: listing.heating_type,
                description: listing.description,
                url: listing.url,
                nearest_tcat_route: listing.nearest_tcat_route,
                elevation_warning: listing.elevation_warning,
                distance_from_campus_miles: listing.distance_from_campus_miles || 0.5,
                is_official_listing: true,
                photos: listing.photos,
                last_scraped_at: runTimestamp,
                updated_at: runTimestamp
            }, { onConflict: 'url' });

        if (error) {
            console.error(`Error upserting ${listing.title}:`, error.message);
            errorCount++;
        } else {
            console.log(`Upserted: ${listing.title}`);
            insertedCount++;
        }
    }

    console.log(`Upsert complete. Inserted/Updated: ${insertedCount}, Errors: ${errorCount}`);

    // Prune stale listings
    // Delete official listings that were NOT updated in this run
    // We use a small buffer (e.g., 1 minute) to be safe, or just check inequality
    console.log("Pruning stale listings...");

    const { error: deleteError, count } = await supabase
        .from('listings')
        .delete({ count: 'exact' })
        .eq('is_official_listing', true)
        .lt('last_scraped_at', runTimestamp);

    if (deleteError) {
        console.error("Error pruning stale listings:", deleteError.message);
    } else {
        console.log(`Pruned ${count} stale listings.`);
    }

}

seed();
