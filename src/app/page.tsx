'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (bedrooms) params.append('bedrooms', bedrooms);
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-red-900 text-white py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find off-campus housing near Cornell.
          </h1>
          <p className="text-xl md:text-2xl text-red-100 mb-10">
            The centralized platform for official listings and student sublets in Ithaca.
          </p>

          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <Input
              placeholder="Price limit (e.g. 1200)"
              className="text-black"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            <Input
              placeholder="Bedrooms"
              className="text-black"
              type="number"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
            />
            <Button
              className="bg-red-700 hover:bg-red-800 w-full md:w-auto"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 container mx-auto">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 flex flex-col items-start h-full">
              <div className="bg-blue-100 p-3 rounded-full mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Official Listings</h2>
              <p className="text-slate-600 mb-6 flex-grow">
                Browse verified properties from local management companies. Filter by distance to campus, heating type, and more.
              </p>
              <Link href="/listings?type=official" className="w-full">
                <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                  Browse Official Listings
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 flex flex-col items-start h-full">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Student Sublets</h2>
              <p className="text-slate-600 mb-6 flex-grow">
                Find a place for the semester or post your own room. Connect directly with other Cornell students.
              </p>
              <div className="flex flex-col gap-2 w-full">
                <Link href="/listings?type=sublet" className="w-full">
                  <Button variant="outline" className="w-full border-red-600 text-red-600 hover:bg-red-50">
                    Browse Sublets
                  </Button>
                </Link>
                <Link href="/sublets/new" className="w-full">
                  <Button className="w-full bg-red-700 hover:bg-red-800 text-white">
                    Post a Sublet
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-xl p-8 shadow-sm border">
          <h3 className="text-xl font-bold mb-6">Smart Insights for Ithaca Living</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-orange-500">⚡</span> Heating Costs
              </h4>
              <p className="text-sm text-slate-600">
                We flag electric baseboard heating so you aren't surprised by high winter bills.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-red-500">⛰️</span> Slope Warnings
              </h4>
              <p className="text-sm text-slate-600">
                Know before you sign if your walk to class involves a steep uphill climb.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-blue-500">🚌</span> TCAT Integration
              </h4>
              <p className="text-sm text-slate-600">
                See which listings are near key routes like the 10, 30, and 81.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
