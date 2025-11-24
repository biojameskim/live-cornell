'use client';

import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { Listing } from '@/types';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface MapComponentProps {
    listings: Listing[];
}

const CORNELL_CENTER = { lat: 42.447, lng: -76.485 }; // Approx center of Cornell/Collegetown

export default function MapComponent({ listings }: MapComponentProps) {
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!}>
            <div className="w-full h-full">
                <Map
                    defaultCenter={CORNELL_CENTER}
                    defaultZoom={14}
                    mapId="cornell-housing-map" // Required for AdvancedMarker, can be any string for dev/testing usually, or needs real ID
                    gestureHandling={'greedy'}
                    disableDefaultUI={false}
                    className="w-full h-full"
                >
                    {listings.map((listing) => (
                        <AdvancedMarker
                            key={listing.id}
                            position={{ lat: listing.latitude, lng: listing.longitude }}
                            onClick={() => setSelectedListing(listing)}
                        >
                            <Pin
                                background={listing.is_official_listing ? '#2563eb' : '#dc2626'} // Blue for official, Red for sublet
                                borderColor={'#ffffff'}
                                glyphColor={'#ffffff'}
                            />
                        </AdvancedMarker>
                    ))}

                    {selectedListing && (
                        <InfoWindow
                            position={{ lat: selectedListing.latitude, lng: selectedListing.longitude }}
                            onCloseClick={() => setSelectedListing(null)}
                        >
                            <div className="p-2 max-w-[200px]">
                                <h3 className="font-bold text-sm mb-1">{selectedListing.title}</h3>
                                <p className="text-xs text-slate-600 mb-2">{selectedListing.address}</p>
                                <p className="text-sm font-semibold text-green-700 mb-2">${selectedListing.rent}/mo</p>
                                <Link href={`/listings/${selectedListing.id}`}>
                                    <Button size="sm" className="w-full h-8 text-xs">View Details</Button>
                                </Link>
                            </div>
                        </InfoWindow>
                    )}
                </Map>
            </div>
        </APIProvider>
    );
}
