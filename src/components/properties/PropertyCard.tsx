import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Listing } from '@/types';
import Link from 'next/link';

interface PropertyCardProps {
    property: Listing;
}

export default function PropertyCard({ property }: PropertyCardProps) {
    return (
        <Link href={`/properties/${property.id}`} className="block h-full">
            <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-200 cursor-pointer group relative overflow-hidden border-0 ring-1 ring-slate-200">
                <CardHeader className="p-0">
                    <div className="h-40 bg-slate-200 w-full relative overflow-hidden">
                        {property.photos && property.photos.length > 0 ? (
                            <img
                                src={property.photos[0]}
                                alt={property.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                No Image
                            </div>
                        )}
                        <div className="absolute top-2 left-2">
                            <Badge className="bg-white/90 text-slate-900 hover:bg-white shadow-sm backdrop-blur-sm text-xs px-2 py-0.5">
                                Official
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-3 flex-grow flex flex-col justify-between bg-white">
                    <div>
                        <h3 className="font-bold text-lg mb-1 group-hover:text-red-700 transition-colors line-clamp-1">
                            {property.title}
                        </h3>
                        <p className="text-slate-500 flex items-center gap-1 text-sm">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {property.neighborhood}
                        </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-sm text-slate-400 font-medium">View Details</span>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
