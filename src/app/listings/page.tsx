import { Suspense } from 'react';
import ListingsView from '@/components/listings/ListingsView';

export default function ListingsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <ListingsView />
        </Suspense>
    );
}
