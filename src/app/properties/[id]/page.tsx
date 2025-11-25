'use client';

export const runtime = 'edge';

import { useState, useEffect, use } from 'react';
import { Listing } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MapComponent from '@/components/map/Map';
import ListingCard from '@/components/listings/ListingCard';
import ReviewSection from '@/components/reviews/ReviewSection';
import Link from 'next/link';

export default function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [property, setProperty] = useState<Listing | null>(null);
    const [units, setUnits] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const res = await fetch(`/api/listings/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProperty(data);

                    // Fetch available units (mock logic for now: fetch listings with same address or just show self if it's a unit)
                    // In a real scenario, we'd query by property_id
                    // For now, let's just fetch all listings and filter by address client-side as a hack, 
                    // or better, just show the property itself as a "unit" if it has rent info.
                    // Since we don't have separate unit data yet, we'll just show the property itself in the "Available Units" list if it has rent > 0.

                    if (data.rent > 0) {
                        setUnits([data]);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch property', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="container mx-auto py-10 text-center">Loading...</div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-slate-50">


                <div className="container mx-auto py-10 text-center">
                    <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
                    <Link href="/properties">
                        <Button variant="outline">Back to Properties</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">


            {/* Hero Section */}
            <div className="w-full h-[400px] bg-slate-900 relative">
                {property.photos && property.photos.length > 0 ? (
                    <img
                        src={property.photos[0]}
                        alt={property.title}
                        className="w-full h-full object-cover opacity-60"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">No Image</div>
                )}
                <div className="absolute inset-0 flex flex-col justify-end pb-10 container mx-auto px-4">
                    <Badge className="w-fit mb-4 bg-blue-600 hover:bg-blue-700 text-white border-none">Official Property</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{property.title}</h1>
                    <p className="text-xl text-slate-200 flex items-center gap-2">
                        📍 {property.address}
                    </p>
                </div>
            </div>

            <div className="container mx-auto py-8 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details & Units */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* About */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">About this Property</h2>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {property.description || "No description provided."}
                            </p>
                        </section>

                        {/* Amenities / Highlights */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Highlights</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Neighborhood</p>
                                            <p className="text-sm text-slate-600">{property.neighborhood}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                {property.nearest_tcat_route && (
                                    <Card>
                                        <CardContent className="p-4 flex items-center gap-3">
                                            <div className="p-2 bg-green-50 rounded-full text-green-600">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                            </div>
                                            <div>
                                                <p className="font-semibold">Transportation</p>
                                                <p className="text-sm text-slate-600">Near Route {property.nearest_tcat_route}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </section>

                        {/* Available Units */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Available Units</h2>
                            {units.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {units.map(unit => (
                                        <div key={unit.id} className="h-[400px]">
                                            <ListingCard listing={unit} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-slate-100 rounded-lg p-8 text-center">
                                    <p className="text-slate-500">No specific units are currently listed for this property.</p>
                                    <Button className="mt-4" variant="outline">Contact for Availability</Button>
                                </div>
                            )}
                        </section>

                        {/* Reviews */}
                        <section>
                            <ReviewSection listingId={property.id} />
                        </section>
                    </div>

                    {/* Right Column: Map & Contact */}
                    <div className="space-y-6">
                        <Card className="overflow-hidden">
                            <CardHeader>
                                <CardTitle>Location</CardTitle>
                            </CardHeader>
                            <div className="h-64">
                                <MapComponent listings={[property]} />
                            </div>
                            <CardContent className="p-4">
                                <p className="text-sm text-slate-500 mb-4">{property.address}</p>
                                <Button className="w-full bg-red-700 hover:bg-red-800">
                                    Get Directions
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Interested?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600 mb-4 text-sm">
                                    Contact the property manager directly for the most up-to-date availability and pricing.
                                </p>
                                <Button className="w-full" variant="outline">
                                    Visit Website
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
