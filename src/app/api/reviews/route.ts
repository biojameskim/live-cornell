import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listing_id');

    if (!listingId) {
        return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch reviews with user profile info and votes
    const { data, error } = await supabase
        .from('reviews')
        .select(`
            *,
            user:profiles(first_name, last_name, avatar_url),
            votes:review_votes(user_id, vote_type)
        `)
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function DELETE(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
        return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id); // Ensure user owns the review

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized', details: authError }, { status: 401 });
    }

    try {
        const json = await request.json();
        const { listing_id, rating, comment } = json;

        if (!listing_id || !rating) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Upsert review (one per user per listing)
        const { data, error } = await supabase
            .from('reviews')
            .upsert({
                listing_id,
                user_id: user.id,
                rating,
                comment
            }, { onConflict: 'listing_id, user_id' })
            .select()
            .single();

        if (error) {
            console.error('Supabase Upsert Error:', error);
            return NextResponse.json({ error: error.message, details: error }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (e: any) {
        console.error('API Error:', e);
        return NextResponse.json({ error: 'Internal Server Error', details: e.message || String(e) }, { status: 500 });
    }
}
