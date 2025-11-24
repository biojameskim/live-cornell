import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import mockListings from '@/data/mock_listings.json';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const { id } = await params;

    try {
        const { data, error } = await supabase
            .from('listings')
            .select(`
                *,
                host:profiles(*)
            `)
            .eq('id', id)
            .maybeSingle(); // Use maybeSingle to avoid error if not found, just returns null

        if (error) {
            console.error('Database error fetching listing:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
