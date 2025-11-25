'use client';

export const runtime = 'edge';

import { useState, useEffect, use } from 'react';
import { Listing } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MapComponent from '@/components/map/Map';
import Link from 'next/link';

export default function ListingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const res = await fetch(`/api/listings/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setListing(data);
                }
            } catch (error) {
                console.error('Failed to fetch listing', error);
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">


                <div className="container mx-auto py-10 text-center">Loading...</div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen bg-slate-50">


                <div className="container mx-auto py-10 text-center">
                    <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
                    <Link href="/listings">
                        <Button variant="outline">Back to Listings</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">

            <div className="container mx-auto py-8 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Photos & Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Photo Gallery */}
                        <div className="bg-slate-200 rounded-lg overflow-hidden aspect-video relative">
                            {listing.photos && listing.photos.length > 0 ? (
                                <img
                                    src={listing.photos[0]}
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">No Image</div>
                            )}
                            <div className="absolute top-4 left-4">
                                {listing.is_official_listing ? (
                                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-3 py-1">Official Listing</Badge>
                                ) : (
                                    <Badge className="bg-red-600 hover:bg-red-700 text-white text-lg px-3 py-1">Sublet</Badge>
                                )}
                            </div>
                        </div>

                        {/* Additional Photos Grid (if any) */}
                        {listing.photos && listing.photos.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {listing.photos.slice(1, 5).map((photo, idx) => (
                                    <div key={idx} className="aspect-square bg-slate-200 rounded-md overflow-hidden">
                                        <img src={photo} alt={`Photo ${idx + 2}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Title & Address */}
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{listing.title}</h1>
                            <p className="text-xl text-slate-600 flex items-center gap-2">
                                📍 {listing.address}
                            </p>
                        </div>

                        {/* Key Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <p className="text-sm text-slate-500">Rent</p>
                                    <p className="text-xl font-bold text-green-700">${listing.rent}/mo</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <p className="text-sm text-slate-500">Bedrooms</p>
                                    <p className="text-xl font-bold">{listing.bedrooms}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <p className="text-sm text-slate-500">Bathrooms</p>
                                    <p className="text-xl font-bold">{listing.bathrooms}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <p className="text-sm text-slate-500">Lease</p>
                                    <p className="text-xl font-bold">{listing.lease_term}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>About this place</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700 whitespace-pre-wrap">{listing.description || "No description provided."}</p>
                            </CardContent>
                        </Card>

                        {/* Amenities / Warnings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Insights</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">Neighborhood:</span> {listing.neighborhood}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">Heating:</span> {listing.heating_type}
                                </div>
                                {listing.nearest_tcat_route && (
                                    <div className="flex items-center gap-2 text-blue-700">
                                        <span>🚌</span> Near TCAT Route {listing.nearest_tcat_route}
                                    </div>
                                )}
                                {listing.elevation_warning && (
                                    <div className="flex items-center gap-2 text-red-600">
                                        <span>⚠️</span> Steep uphill walk to campus
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Host & Map */}
                    <div className="space-y-6">
                        {/* Host Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Hosted by</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center text-center">
                                <Avatar className="w-20 h-20 mb-4">
                                    <AvatarImage src={listing.host?.avatar_url || ''} />
                                    <AvatarFallback>{listing.host?.first_name?.[0] || 'H'}</AvatarFallback>
                                </Avatar>
                                <h3 className="text-xl font-semibold mb-1">
                                    {listing.host?.first_name ? `${listing.host.first_name} ${listing.host.last_name}` : 'Cornell Student'}
                                </h3>
                                <p className="text-sm text-slate-500 mb-4">Joined {new Date(listing.created_at).getFullYear()}</p>

                                <Button className="w-full bg-red-700 hover:bg-red-800">
                                    Contact Host
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Map */}
                        <Card className="h-64 overflow-hidden">
                            <MapComponent listings={[listing]} />
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
