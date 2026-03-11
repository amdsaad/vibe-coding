-- Vibes Portfolio Platform: Database Schema
-- Run this in Supabase SQL Editor or apply via MCP migration

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Profiles table
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  username text unique not null,
  display_name text not null,
  bio text,
  avatar_url text,
  category text not null default 'creative',
  theme text not null default 'minimal',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Social links table
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  platform text not null,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  url text,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists profiles_username_idx on public.profiles(username);
create index if not exists social_links_profile_id_idx on public.social_links(profile_id);
create index if not exists projects_profile_id_idx on public.projects(profile_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.social_links enable row level security;
alter table public.projects enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (is_published = true);

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can create their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = user_id);

-- Social links policies
create policy "Social links are viewable with published profile"
  on public.social_links for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = social_links.profile_id
      and (profiles.is_published = true or profiles.user_id = auth.uid())
    )
  );

create policy "Users can manage their own social links"
  on public.social_links for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = social_links.profile_id
      and profiles.user_id = auth.uid()
    )
  );

-- Projects policies
create policy "Projects are viewable with published profile"
  on public.projects for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = projects.profile_id
      and (profiles.is_published = true or profiles.user_id = auth.uid())
    )
  );

create policy "Users can manage their own projects"
  on public.projects for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = projects.profile_id
      and profiles.user_id = auth.uid()
    )
  );
