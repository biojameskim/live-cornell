'use client';

import { useState, useEffect, Suspense } from 'react';

export const dynamic = 'force-dynamic';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { Listing, Profile } from '@/types';
import ListingCard from '@/components/listings/ListingCard';

function ProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') || 'profile';

    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [myListings, setMyListings] = useState<Listing[]>([]);
    const [favorites, setFavorites] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);

            // Fetch Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileData) {
                setProfile(profileData);
                setFirstName(profileData.first_name || '');
                setLastName(profileData.last_name || '');
                setAvatarUrl(profileData.avatar_url || user.user_metadata?.avatar_url || '');
            }

            // Fetch My Listings
            const { data: listingsData } = await supabase
                .from('listings')
                .select('*')
                .eq('user_id', user.id);
            setMyListings(listingsData || []);

            // Fetch Favorites
            const res = await fetch('/api/favorites');
            if (res.ok) {
                const favs = await res.json();
                setFavorites(favs);
            }

            setLoading(false);
        };
        fetchData();
    }, [router, supabase]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        setSaving(true);
        try {
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setAvatarUrl(publicUrl);

            // Auto-save the new URL to profile
            await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            // Dispatch event to update Navbar
            window.dispatchEvent(new Event('profileUpdated'));

            router.refresh();
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Error uploading avatar');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/profiles', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    avatar_url: avatarUrl
                }),
            });
            const data = await res.json();

            if (res.ok) {
                alert('Profile updated!');
                setIsEditing(false); // Exit edit mode

                // Dispatch event to update Navbar
                window.dispatchEvent(new Event('profileUpdated'));

                router.refresh();
            } else {
                console.error('Profile update error:', data);
                alert(`Failed to update profile: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Profile update exception:', error);
            alert('Failed to update profile: Network error');
        } finally {
            setSaving(false);
        }
    };

    const handleTabChange = (val: string) => {
        router.push(`/profile?tab=${val}`);
    };

    if (loading) {
        return <div className="container mx-auto py-10 text-center">Loading...</div>;
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">My Account</h1>

            <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="listings">My Listings</TabsTrigger>
                    <TabsTrigger value="favorites">Favorites</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card className="max-w-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Personal Information</CardTitle>
                            {!isEditing && (
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                    Edit Profile
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="flex flex-col items-center mb-6 gap-4">
                                        <Avatar className="w-24 h-24">
                                            <AvatarImage src={avatarUrl} />
                                            <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex items-center gap-2">
                                            <Button type="button" variant="outline" size="sm" className="relative">
                                                Change Photo
                                                <input
                                                    type="file"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    accept="image/*"
                                                    onChange={handleAvatarUpload}
                                                    disabled={saving}
                                                />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">First Name</label>
                                        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Last Name</label>
                                        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsEditing(false)} disabled={saving}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="flex-1 bg-red-700 hover:bg-red-800" disabled={saving}>
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-6 text-center">
                                    <div className="flex justify-center">
                                        <Avatar className="w-32 h-32">
                                            <AvatarImage src={avatarUrl} />
                                            <AvatarFallback className="text-4xl">{user?.email?.[0].toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900">
                                            {firstName || lastName ? `${firstName} ${lastName}` : 'No Name Set'}
                                        </h3>
                                        <p className="text-slate-500">{user?.email}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="listings">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">My Posted Sublets</h2>
                        {myListings.length === 0 ? (
                            <p className="text-slate-500">You haven't posted any sublets yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {myListings.map(listing => (
                                    <ListingCard key={listing.id} listing={listing} />
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="favorites">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Saved Listings</h2>
                        {favorites.length === 0 ? (
                            <p className="text-slate-500">You haven't saved any listings yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {favorites.map(listing => (
                                    <ListingCard key={listing.id} listing={listing} />
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-slate-50">

            <Suspense fallback={<div className="container mx-auto py-10 text-center">Loading...</div>}>
                <ProfileContent />
            </Suspense>
        </div>
    );
}
