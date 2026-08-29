-- Run this once inside your Supabase project's SQL Editor.
-- It creates the table that stores every antibody/reagent report
-- and locks it down so only verified, signed-in users can submit.

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  user_id uuid references auth.users(id) on delete set null,

  target text not null,          -- e.g. "Ki-67"
  vendor text not null,          -- e.g. "Abcam"
  catalog_number text,           -- e.g. "ab16667"
  clone text,                    -- e.g. "MIB-1"
  cell_line text not null,       -- e.g. "MCF-7"
  cancer_type text,              -- e.g. "Breast cancer"
  technique text not null,       -- e.g. "IHC", "Western blot", "Flow cytometry"
  dilution text,                 -- e.g. "1:200"
  worked boolean not null,       -- true = worked, false = did not work
  notes text
);

-- Row Level Security: on by default, nobody can read/write until we add policies.
alter table entries enable row level security;

-- Anyone (including logged-out visitors) can read entries — it's a public database.
create policy "Entries are publicly readable"
  on entries for select
  using (true);

-- Only signed-in (email-verified) users can add a new entry.
create policy "Signed-in users can insert entries"
  on entries for insert
  with check (auth.uid() = user_id);

-- Users can only edit or delete their own entries.
create policy "Users can update their own entries"
  on entries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own entries"
  on entries for delete
  using (auth.uid() = user_id);

-- Helpful index for the search page.
create index if not exists entries_target_idx on entries using gin (to_tsvector('english', target));
