import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import mockListings from '@/data/mock_listings.json';

export const runtime = 'edge';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const supabase = await createClient();

    // Filters
    const neighborhood = searchParams.get('neighborhood');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const bedrooms = searchParams.get('bedrooms');
    const heating = searchParams.get('heating');
    const type = searchParams.get('type');

    try {
        let query = supabase.from('listings').select('*');

        if (neighborhood) query = query.eq('neighborhood', neighborhood);
        if (minPrice) query = query.gte('rent', minPrice);
        if (maxPrice) query = query.lte('rent', maxPrice);
        if (bedrooms) query = query.gte('bedrooms', bedrooms);
        if (heating) query = query.eq('heating_type', heating);

        if (type === 'official') query = query.eq('is_official_listing', true);
        if (type === 'sublet') query = query.eq('is_official_listing', false);

        const { data, error } = await query;

        if (error) {
            console.warn('Supabase error, falling back to mock data:', error.message);
            // Fallback to mock data filtering
            let filtered = mockListings;
            if (neighborhood) filtered = filtered.filter(l => l.neighborhood === neighborhood);
            if (minPrice) filtered = filtered.filter(l => l.rent >= parseInt(minPrice));
            if (maxPrice) filtered = filtered.filter(l => l.rent <= parseInt(maxPrice));
            if (bedrooms) filtered = filtered.filter(l => l.bedrooms >= parseInt(bedrooms));
            if (heating) filtered = filtered.filter(l => l.heating_type === heating);
            if (type === 'official') filtered = filtered.filter(l => l.is_official_listing === true);
            if (type === 'sublet') filtered = filtered.filter(l => l.is_official_listing === false);

            return NextResponse.json(filtered);
        }

        return NextResponse.json(data);
    } catch (e) {
        console.error('API Error:', e);
        return NextResponse.json(mockListings);
    }
}
