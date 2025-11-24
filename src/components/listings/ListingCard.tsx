import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Listing } from '@/types';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ListingCardProps {
    listing: Listing;
    initialFavorited?: boolean;
}

export default function ListingCard({ listing, initialFavorited = false }: ListingCardProps) {
    const [isFavorited, setIsFavorited] = useState(initialFavorited);
    const [loading, setLoading] = useState(false);

    // Sync state with prop when it changes (e.g. after async fetch)
    useEffect(() => {
        setIsFavorited(initialFavorited);
    }, [initialFavorited]);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();
        setLoading(true);

        try {
            const res = await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listing_id: listing.id }),
            });

            if (res.ok) {
                const data = await res.json();
                setIsFavorited(data.favorited);
            } else {
                // If 401, maybe redirect to login or show toast
                console.error('Failed to toggle favorite');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const borderClass = listing.is_official_listing
        ? 'border-l-4 border-l-blue-500'
        : 'border-l-4 border-l-red-500';

    return (
        <Link href={`/listings/${listing.id}`} className="block h-full">
            <Card className={`h-full flex flex-col hover:shadow-lg transition-all duration-200 cursor-pointer group relative ${borderClass}`}>
                <button
                    onClick={toggleFavorite}
                    className={`absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors ${isFavorited ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                </button>

                <CardHeader className="p-0">
                    <div className="h-48 bg-slate-200 w-full relative overflow-hidden">
                        {listing.photos && listing.photos.length > 0 ? (
                            <img
                                src={listing.photos[0]}
                                alt={listing.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                No Image
                            </div>
                        )}
                        <div className="absolute bottom-2 left-2 flex gap-1">
                            {listing.is_official_listing ? (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">Official</Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">Sublet</Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg leading-tight group-hover:text-red-700 transition-colors line-clamp-1">{listing.title}</h3>
                        <span className="font-bold text-green-700 text-lg whitespace-nowrap ml-2">${listing.rent}</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-1">{listing.address}</p>

                    <div className="flex gap-2 text-sm text-slate-600 mb-4">
                        <span>{listing.bedrooms} Bed</span>
                        <span>•</span>
                        <span>{listing.bathrooms} Bath</span>
                    </div>

                    <div className="space-y-2">
                        {listing.elevation_warning && (
                            <div className="text-xs flex items-center gap-1 text-red-600 bg-red-50 p-1 rounded">
                                <span>⚠️</span> Steep uphill
                            </div>
                        )}
                        {listing.heating_type === 'Electric Baseboard' && (
                            <div className="text-xs flex items-center gap-1 text-orange-600 bg-orange-50 p-1 rounded">
                                <span>⚡</span> High heating cost
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
