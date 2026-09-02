-- Run this ONCE in your Supabase SQL Editor to bring your live database
-- up to date. Safe to run on a table that already has data — nothing
-- is deleted, only added/renamed.

-- Broaden beyond antibodies-only / cancer-only.
alter table entries
  add column if not exists category text not null default 'Antibody';

alter table entries
  rename column cancer_type to research_area;

create index if not exists entries_category_idx on entries (category);

-- Optional publication link, shown as a trust badge if filled in.
alter table entries
  add column if not exists doi_url text;

-- Public author identity: a display name (never the email) plus whether
-- their sign-up email looked academic/institutional.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  is_academic boolean not null default false,
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;

create policy "Profiles are publicly readable"
  on profiles for select
  using (true);

create policy "Users can create their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);
