-- Run this once in your Supabase SQL Editor. Adds the optional ORCID iD
-- field to profiles. Safe to run even if you already ran migration_to_v5.sql.

alter table profiles
  add column if not exists orcid_id text;
