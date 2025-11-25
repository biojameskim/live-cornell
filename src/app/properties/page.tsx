'use client';

export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { Listing } from '@/types';
import PropertyCard from '@/components/properties/PropertyCard';
import MapComponent from '@/components/map/Map';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PropertiesPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        neighborhood: 'all',
        bedrooms: 'all',
    });

    useEffect(() => {
        fetchProperties();
    }, [filters]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('type', 'official'); // Force official listings
            if (filters.neighborhood !== 'all') params.append('neighborhood', filters.neighborhood);
            if (filters.bedrooms !== 'all') params.append('bedrooms', filters.bedrooms);

            const res = await fetch(`/api/listings?${params.toString()}`);
            const data = await res.json();
            setListings(data);
        } catch (error) {
            console.error('Failed to fetch properties', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">


            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-4">Ithaca Properties</h1>
                    <p className="text-slate-600 max-w-2xl">
                        Explore all official housing options in Ithaca. Research properties, check amenities, and find your perfect location, regardless of current availability.
                    </p>
                </div>

                {/* Map Section */}
                <div className="mb-8 h-[400px] w-full rounded-lg overflow-hidden border shadow-sm">
                    <MapComponent listings={listings} />
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-sm border mb-8 flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-64">
                        <Select
                            value={filters.neighborhood}
                            onValueChange={(val) => handleFilterChange('neighborhood', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Neighborhood" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Neighborhoods</SelectItem>
                                <SelectItem value="Collegetown">Collegetown</SelectItem>
                                <SelectItem value="Fall Creek">Fall Creek</SelectItem>
                                <SelectItem value="Downtown">Downtown</SelectItem>
                                <SelectItem value="Varna">Varna</SelectItem>
                                <SelectItem value="Lansing">Lansing</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full md:w-64">
                        <Select
                            value={filters.bedrooms}
                            onValueChange={(val) => handleFilterChange('bedrooms', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Bedrooms" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Any Bedrooms</SelectItem>
                                <SelectItem value="1">1+</SelectItem>
                                <SelectItem value="2">2+</SelectItem>
                                <SelectItem value="3">3+</SelectItem>
                                <SelectItem value="4">4+</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
                        <p className="text-slate-500">Loading properties...</p>
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg border">
                        <p className="text-slate-500 text-lg">No properties found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {listings.map(listing => (
                            <div key={listing.id} className="h-full">
                                <PropertyCard property={listing} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
