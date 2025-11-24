import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET: Fetch user's favorites
export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('favorites')
        .select(`
            listing_id,
            listing:listings(*)
        `)
        .eq('user_id', user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to return just the listings
    const favorites = data.map((f: any) => f.listing);

    return NextResponse.json(favorites);
}

// POST: Toggle favorite
export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { listing_id } = body;

    if (!listing_id) {
        return NextResponse.json({ error: 'Missing listing_id' }, { status: 400 });
    }

    // Check if already favorited
    const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listing_id)
        .single();

    if (existing) {
        // Remove favorite
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('id', existing.id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ favorited: false });
    } else {
        // Add favorite
        const { error } = await supabase
            .from('favorites')
            .insert({ user_id: user.id, listing_id });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ favorited: true });
    }
}
