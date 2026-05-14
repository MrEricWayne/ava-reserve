-- ============================================
-- AVA RESERVE — Supabase Database Schema
-- Run this entire file in your Supabase
-- SQL Editor (supabase.com → SQL Editor)
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── PROFILES ──────────────────────────────────
-- Extends Supabase auth.users with extra fields
create table public.profiles (
  id           uuid references auth.users(id) on delete cascade primary key,
  first_name   text not null default '',
  last_name    text not null default '',
  phone        text default '',
  tier         text not null default 'regular' check (tier in ('regular','premium','vip')),
  is_admin     boolean not null default false,
  avatar_url   text default '',
  created_at   timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, first_name, last_name, phone, tier, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'tier', 'regular'),
    false
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── BOOKINGS ──────────────────────────────────
create table public.bookings (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references public.profiles(id) on delete cascade not null,
  date         date not null,
  time_slot    text not null,
  bay          text not null,
  service      text not null,
  vehicle      text not null default '',
  notes        text default '',
  status       text not null default 'confirmed' check (status in ('confirmed','completed','cancelled')),
  created_at   timestamptz not null default now()
);

-- ── GALLERY ───────────────────────────────────
create table public.gallery (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  caption      text default '',
  storage_path text default '',
  public_url   text default '',
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

-- Seed with placeholder gallery items
insert into public.gallery (title, caption, sort_order) values
  ('Main Shop Floor',    'All 5 bays ready for action',       1),
  ('Lift Bay 3',         'BendPak 2-post 10,000 lb lift',     2),
  ('Tool Wall',          'Full Snap-on professional tool set', 3),
  ('Detailing Pod',      'Bay 5 — climate controlled',        4),
  ('Customer Lounge',    'WiFi, coffee & comfortable seating', 5),
  ('Alignment Bay',      'Hunter alignment system',            6);

-- ── ROW LEVEL SECURITY ────────────────────────
alter table public.profiles enable row level security;
alter table public.bookings  enable row level security;
alter table public.gallery   enable row level security;

-- Profiles: users can read/update their own; admins can read all
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Bookings: users see their own; admins see all
create policy "Users can view own bookings"
  on public.bookings for select using (auth.uid() = user_id);

create policy "Users can insert own bookings"
  on public.bookings for insert with check (auth.uid() = user_id);

create policy "Users can update own bookings"
  on public.bookings for update using (auth.uid() = user_id);

create policy "Admins can manage all bookings"
  on public.bookings for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Gallery: anyone can view; only admins can modify
create policy "Anyone can view gallery"
  on public.gallery for select using (true);

create policy "Admins can manage gallery"
  on public.gallery for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ── STORAGE BUCKET ────────────────────────────
-- Run separately in Supabase Storage dashboard:
-- Create a bucket named: ava-reserve-images
-- Set it to PUBLIC
-- Or run:
insert into storage.buckets (id, name, public) values ('ava-reserve-images', 'ava-reserve-images', true)
  on conflict do nothing;

create policy "Anyone can view images"
  on storage.objects for select using (bucket_id = 'ava-reserve-images');

create policy "Authenticated users can upload images"
  on storage.objects for insert with check (
    bucket_id = 'ava-reserve-images' and auth.role() = 'authenticated'
  );

create policy "Admins can delete images"
  on storage.objects for delete using (
    bucket_id = 'ava-reserve-images' and
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ── MAKE FIRST USER ADMIN ─────────────────────
-- After signing up your admin account, run this:
-- update public.profiles set is_admin = true where id = 'YOUR-USER-UUID';
