'use client';



import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

export default function NewSubletPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        address: '',
        rent: '',
        bedrooms: '',
        bathrooms: '',
        neighborhood: '',
        heating_type: '',
        description: '',
        start_date: '',
        end_date: ''
    });

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const supabase = createClient();

            // Check if user is logged in
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("You must be logged in to post a sublet! Redirecting to login...");
                router.push('/login');
                setLoading(false);
                return;
            }

            const photoUrls: string[] = [];

            // Upload photos
            for (const file of selectedFiles) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('listings')
                    .upload(filePath, file);

                if (uploadError) {
                    throw uploadError;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('listings')
                    .getPublicUrl(filePath);

                photoUrls.push(publicUrl);
            }

            const res = await fetch('/api/sublets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    rent: parseInt(formData.rent),
                    bedrooms: parseInt(formData.bedrooms),
                    bathrooms: parseFloat(formData.bathrooms),
                    photos: photoUrls,
                    // Defaults/Inferred
                    latitude: 42.444, // Mock
                    longitude: -76.501, // Mock
                    nearest_tcat_route: 'Unknown',
                    elevation_warning: false,
                    distance_from_campus_miles: 1.0
                }),
            });

            if (res.ok) {
                router.push('/listings');
            } else {
                const error = await res.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Submission error', error);
            alert('Failed to submit sublet');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">

            <div className="container mx-auto py-10 px-4">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-red-700">Post a Sublet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    required
                                    placeholder="e.g. Sunny Room in Collegetown"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Address</label>
                                <Input
                                    required
                                    placeholder="Street Address"
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Monthly Rent ($)</label>
                                    <Input
                                        required
                                        type="number"
                                        placeholder="1000"
                                        value={formData.rent}
                                        onChange={(e) => handleChange('rent', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Neighborhood</label>
                                    <Select
                                        value={formData.neighborhood}
                                        onValueChange={(val) => handleChange('neighborhood', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Collegetown">Collegetown</SelectItem>
                                            <SelectItem value="Fall Creek">Fall Creek</SelectItem>
                                            <SelectItem value="Downtown">Downtown</SelectItem>
                                            <SelectItem value="Varna">Varna</SelectItem>
                                            <SelectItem value="Lansing">Lansing</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Bedrooms</label>
                                    <Input
                                        required
                                        type="number"
                                        value={formData.bedrooms}
                                        onChange={(e) => handleChange('bedrooms', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Bathrooms</label>
                                    <Input
                                        required
                                        type="number"
                                        step="0.5"
                                        value={formData.bathrooms}
                                        onChange={(e) => handleChange('bathrooms', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Heating Type</label>
                                <Select
                                    value={formData.heating_type}
                                    onValueChange={(val) => handleChange('heating_type', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Gas">Gas</SelectItem>
                                        <SelectItem value="Electric Baseboard">Electric Baseboard</SelectItem>
                                        <SelectItem value="Steam">Steam</SelectItem>
                                        <SelectItem value="Unknown">Unknown</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    placeholder="Tell us about the place..."
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Photos</label>
                                <Input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="cursor-pointer"
                                />
                                <p className="text-xs text-slate-500">Select multiple images to upload.</p>
                            </div>

                            <Button type="submit" className="w-full bg-red-700 hover:bg-red-800" disabled={loading}>
                                {loading ? 'Uploading & Posting...' : 'Post Sublet'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
