'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState<string | null>(null);
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();

        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('first_name, avatar_url')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    if (profile.first_name) {
                        setUserName(profile.first_name);
                    }
                    if (profile.avatar_url) {
                        setUserAvatar(profile.avatar_url);
                    }
                }
            }
            setLoading(false);
        };
        checkUser();

        const fetchProfile = async (userId: string) => {
            const { data: profile } = await supabase
                .from('profiles')
                .select('first_name, avatar_url')
                .eq('id', userId)
                .single();

            if (profile) {
                if (profile.first_name) {
                    setUserName(profile.first_name);
                }
                if (profile.avatar_url) {
                    setUserAvatar(profile.avatar_url);
                }
            }
        };

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setUserName(null);
                setUserAvatar(null);
            }
        });

        // Listen for profile updates
        const handleProfileUpdate = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                fetchProfile(user.id);
            }
        };

        window.addEventListener('profileUpdated', handleProfileUpdate);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <nav className="border-b bg-white">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-red-700">
                    Live Cornell
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/listings" className="text-sm font-medium hover:text-red-700 transition-colors">
                        Browse Listings
                    </Link>
                    <Link href="/sublets/new" className="text-sm font-medium hover:text-red-700 transition-colors">
                        Post a Sublet
                    </Link>

                    {loading ? (
                        <div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse" />
                    ) : user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative flex items-center gap-2 pl-2 pr-4 py-2 h-auto rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={userAvatar || user.user_metadata?.avatar_url} alt={user.email || ''} />
                                        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium text-slate-700">
                                        {userName || 'My Account'}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">My Account</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push('/profile')}>
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/profile?tab=listings')}>
                                    My Listings
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/profile?tab=favorites')}>
                                    Favorites
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut}>
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Log in</Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm" className="bg-red-700 hover:bg-red-800">Sign up</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
