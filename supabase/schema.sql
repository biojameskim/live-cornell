-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enums (Safely created)
do $$ begin
    create type neighborhood_enum as enum (
      'Collegetown', 'Fall Creek', 'Downtown', 'Varna', 'Lansing'
    );
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type lease_term_enum as enum (
      '10-month', '11-month', '12-month', 'Sublet'
    );
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type heating_type_enum as enum (
      'Gas', 'Electric Baseboard', 'Steam', 'Unknown'
    );
exception
    when duplicate_object then null;
end $$;

-- Listings Table
create table if not exists listings (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  address text not null,
  latitude double precision not null,
  longitude double precision not null,
  rent integer not null,
  bedrooms integer not null,
  bathrooms numeric not null,
  neighborhood neighborhood_enum not null,
  lease_term lease_term_enum not null,
  heating_type heating_type_enum not null,
  nearest_tcat_route text,
  elevation_warning boolean default false,
  distance_from_campus_miles double precision,
  is_official_listing boolean default false,
  url text unique,
  description text,
  photos text[], -- Array of image URLs
  user_id uuid references profiles(id), -- Nullable for official listings
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  start_date date,
  end_date date,
  last_scraped_at timestamptz default now()
);

-- Ensure foreign key references profiles(id) for PostgREST join
do $$ begin
  alter table listings drop constraint if exists listings_user_id_fkey;
  alter table listings add constraint listings_user_id_fkey foreign key (user_id) references profiles(id);
exception
  when undefined_object then null;
  when duplicate_object then null;
end $$;

-- Favorites Table
create table if not exists favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  listing_id uuid references listings(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, listing_id)
);

alter table favorites enable row level security;

drop policy if exists "Users can view their own favorites" on favorites;
create policy "Users can view their own favorites"
  on favorites for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own favorites" on favorites;
create policy "Users can insert their own favorites"
  on favorites for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can delete their own favorites" on favorites;
create policy "Users can delete their own favorites"
  on favorites for delete
  using ( auth.uid() = user_id );

-- RLS Policies for Listings
alter table listings enable row level security;

-- Safely create policies (drop first to avoid errors on re-run)
drop policy if exists "Public listings are viewable by everyone" on listings;
create policy "Public listings are viewable by everyone"
  on listings for select
  using ( true );

drop policy if exists "Users can insert their own listings" on listings;
create policy "Users can insert their own listings"
  on listings for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update their own listings" on listings;
create policy "Users can update their own listings"
  on listings for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete their own listings" on listings;
create policy "Users can delete their own listings"
  on listings for delete
  using ( auth.uid() = user_id );

-- Storage Bucket for Photos
insert into storage.buckets (id, name, public) 
values ('listings', 'listings', true)
on conflict (id) do nothing;

-- Storage Policies
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'listings' );

drop policy if exists "Authenticated users can upload" on storage.objects;
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'listings' and auth.role() = 'authenticated' );

-- Storage Bucket for Avatars
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatars are publicly accessible" on storage.objects;
create policy "Avatars are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid() = owner );

-- Reports Table (MVP)
create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id) on delete cascade,
  reporter_id uuid references auth.users(id),
  reason text not null,
  created_at timestamptz default now()
);

alter table reports enable row level security;

drop policy if exists "Users can create reports" on reports;
create policy "Users can create reports"
  on reports for insert
  with check ( auth.uid() = reporter_id );

drop policy if exists "Admins can view reports" on reports;
create policy "Admins can view reports"
  on reports for select
  using ( true ); -- TODO: Restrict to admins

-- Profiles Table
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  avatar_url text,
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone" on profiles;
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (new.id, '', '')
  on conflict (id) do nothing; -- Handle potential conflicts
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Inquiries Table (Messaging)
create table if not exists inquiries (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id) on delete cascade,
  sender_id uuid references auth.users(id),
  message text not null,
  created_at timestamptz default now()
);

alter table inquiries enable row level security;

drop policy if exists "Senders can view own inquiries" on inquiries;
create policy "Senders can view own inquiries"
  on inquiries for select
  using ( auth.uid() = sender_id );

drop policy if exists "Hosts can view inquiries for their listings" on inquiries;
create policy "Hosts can view inquiries for their listings"
  on inquiries for select
  using (
    exists (
      select 1 from listings
      where listings.id = inquiries.listing_id
      and listings.user_id = auth.uid()
    )
  );

drop policy if exists "Users can create inquiries" on inquiries;
create policy "Users can create inquiries"
  on inquiries for insert
  with check ( auth.uid() = sender_id );
