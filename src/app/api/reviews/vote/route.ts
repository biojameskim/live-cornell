import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const json = await request.json();
        const { review_id, vote_type } = json; // vote_type: 1, -1, or 0 (remove)

        if (!review_id) {
            return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
        }

        if (vote_type === 0) {
            // Remove vote
            const { error } = await supabase
                .from('review_votes')
                .delete()
                .eq('review_id', review_id)
                .eq('user_id', user.id);

            if (error) throw error;
        } else {
            // Upsert vote
            const { error } = await supabase
                .from('review_votes')
                .upsert({
                    review_id,
                    user_id: user.id,
                    vote_type
                }, { onConflict: 'review_id, user_id' });

            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('Vote API Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
