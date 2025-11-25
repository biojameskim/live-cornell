-- Create Review Votes Table
create table if not exists review_votes (
  id uuid primary key default uuid_generate_v4(),
  review_id uuid references reviews(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  vote_type integer not null check (vote_type = 1 or vote_type = -1),
  created_at timestamptz default now(),
  unique(review_id, user_id)
);

-- Enable RLS
alter table review_votes enable row level security;

-- Policies
create policy "Votes are viewable by everyone"
  on review_votes for select
  using ( true );

create policy "Authenticated users can vote"
  on review_votes for insert
  with check ( auth.role() = 'authenticated' and auth.uid() = user_id );

create policy "Users can update their own vote"
  on review_votes for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own vote"
  on review_votes for delete
  using ( auth.uid() = user_id );
