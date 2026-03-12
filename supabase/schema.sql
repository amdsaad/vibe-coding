-- Vibes Portfolio Platform: Database Schema
-- Run this in Supabase SQL Editor or apply via MCP migration

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Auto-update updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Profiles table
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  username text not null,
  slug text not null unique,
  bio text,
  avatar_url text,
  category text not null default 'developer'
    check (category in ('developer', 'designer', 'photographer', 'writer', 'marketer', 'data_scientist', 'product_manager', 'other')),
  theme text not null default 'minimal'
    check (theme in ('minimal', 'bold', 'elegant', 'neon', 'paper', 'terminal')),
  skills text[] not null default '{}',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Social links table
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  platform text not null,
  url text not null,
  sort_order integer not null default 0
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
create unique index if not exists profiles_slug_idx on public.profiles(slug);
create index if not exists profiles_category_idx on public.profiles(category);
create index if not exists profiles_created_at_idx on public.profiles(created_at desc);
create index if not exists social_links_profile_id_idx on public.social_links(profile_id);
create index if not exists projects_profile_id_idx on public.projects(profile_id);

-- Triggers for updated_at
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at();

create trigger projects_updated_at
  before update on public.projects
  for each row execute function update_updated_at();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.social_links enable row level security;
alter table public.projects enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (published = true);

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
      and (profiles.published = true or profiles.user_id = auth.uid())
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
      and (profiles.published = true or profiles.user_id = auth.uid())
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
