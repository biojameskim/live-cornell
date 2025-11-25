-- Drop table if exists to reset
drop table if exists reviews;

-- Create Reviews Table with correct reference to profiles
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade, -- Changed from auth.users(id) to profiles(id)
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  unique(listing_id, user_id)
);

-- Enable RLS
alter table reviews enable row level security;

-- Policies
create policy "Reviews are viewable by everyone"
  on reviews for select
  using ( true );

create policy "Authenticated users can create reviews"
  on reviews for insert
  with check ( auth.role() = 'authenticated' and auth.uid() = user_id );

create policy "Users can update their own reviews"
  on reviews for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own reviews"
  on reviews for delete
  using ( auth.uid() = user_id );
