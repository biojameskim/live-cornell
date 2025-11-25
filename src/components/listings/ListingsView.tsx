'use client';

import { useState, useEffect } from 'react';
import { Listing } from '@/types';
import ListingCard from './ListingCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MapComponent from '@/components/map/Map';

import { useSearchParams } from 'next/navigation';

export default function ListingsView() {
    const searchParams = useSearchParams();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        neighborhood: searchParams.get('neighborhood') || 'all',
        bedrooms: searchParams.get('bedrooms') || 'all',
        type: searchParams.get('type') || 'all'
    });

    useEffect(() => {
        const newFilters = {
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
            neighborhood: searchParams.get('neighborhood') || 'all',
            bedrooms: searchParams.get('bedrooms') || 'all',
            type: searchParams.get('type') || 'all'
        };
        setFilters(newFilters);
        fetchListings(newFilters);
    }, [searchParams]);

    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Initial fetch is handled by the searchParams effect
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const res = await fetch('/api/favorites');
            if (res.ok) {
                const data = await res.json();
                // data is array of listings, we just need IDs
                setFavorites(new Set(data.map((l: Listing) => l.id)));
            }
        } catch (error) {
            console.error('Failed to fetch favorites', error);
        }
    };

    const fetchListings = async (currentFilters = filters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (currentFilters.minPrice) params.append('minPrice', currentFilters.minPrice);
            if (currentFilters.maxPrice) params.append('maxPrice', currentFilters.maxPrice);
            if (currentFilters.neighborhood !== 'all') params.append('neighborhood', currentFilters.neighborhood);
            if (currentFilters.bedrooms !== 'all') params.append('bedrooms', currentFilters.bedrooms);
            if (currentFilters.type !== 'all') params.append('type', currentFilters.type);

            const res = await fetch(`/api/listings?${params.toString()}`);
            const data = await res.json();
            setListings(data);
        } catch (error) {
            console.error('Failed to fetch listings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">


            <div className="flex-grow flex flex-col md:flex-row h-[calc(100vh-64px)]">
                {/* Sidebar / List */}
                <div className="w-full md:w-1/2 lg:w-2/5 p-4 overflow-y-auto border-r bg-white">
                    <div className="mb-6 space-y-4">
                        <h1 className="text-2xl font-bold">Cornell Housing</h1>

                        {/* Filters */}
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                placeholder="Min Price"
                                type="number"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            />
                            <Input
                                placeholder="Max Price"
                                type="number"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            />
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
                            <Select
                                value={filters.type}
                                onValueChange={(val) => handleFilterChange('type', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="official">Official Listings</SelectItem>
                                    <SelectItem value="sublet">Sublets</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={() => fetchListings()} className="w-full bg-red-700 hover:bg-red-800">
                            Apply Filters
                        </Button>
                    </div>

                    {/* Results */}
                    {loading ? (
                        <div className="text-center py-10">Loading listings...</div>
                    ) : listings.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">No listings found matching your criteria.</div>
                    ) : (
                        <div className="grid gap-4">
                            {listings.map(listing => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                    initialFavorited={favorites.has(listing.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Map Container */}
                <div className="hidden md:block w-1/2 lg:w-3/5 bg-slate-200 relative">
                    <MapComponent listings={listings} />
                </div>
            </div>
        </div>
    );
}
