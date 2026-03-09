# INSTRUCTIONS.md — Portfolio Profile Creator

> **How to use:** Tell Claude Code "Follow INSTRUCTIONS.md, start with Phase 1" — then review and move to the next phase one at a time.

---

## Project Overview

Build a portfolio profile creator where users sign up, create a public profile at `/u/their-slug`, pick a theme and category, and manage projects/skills/social links. Landing page shows recent profiles. All profiles are publicly browsable.

**Base project:** Clean Next.js 16 starter (React 19.2, TypeScript, Tailwind CSS v4). The starter already has `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `tailwind.config.ts`, `tsconfig.json`, and `next.config.ts`.

---

## Hard Rules (apply to ALL phases)

### Do
- Use `proxy.ts` at the project root (NOT `middleware.ts` — it is deprecated in Next.js 16)
- Use `supabase.auth.getClaims()` for ALL server-side auth checks — never `getSession()`
- Use `"use server"` for all data mutations (Server Actions)
- Use Server Components by default — only add `"use client"` when the component needs interactivity
- Keep client components small and leaf-level
- Use `useActionState` from React for all form state/submission
- Validate ALL form inputs with zod on the server side inside the Server Action, even if also validated on the client
- Use `revalidatePath()` after every mutation
- Use TypeScript strict mode — no `any` types
- Use `@/` import alias for all imports
- Use Tailwind CSS utility classes for all styling — no CSS modules, no styled-components
- Use `next@16.0.10` or later (security patches for RSC vulnerabilities)

### Do NOT
- Do NOT install Prisma or any ORM — use Supabase client directly
- Do NOT install react-hook-form or @hookform/resolvers
- Do NOT install any UI component library (no shadcn, no radix, no MUI)
- Do NOT use `middleware.ts` — use `proxy.ts`
- Do NOT use `getSession()` for auth on the server
- Do NOT use `NEXT_PUBLIC_SUPABASE_ANON_KEY` — use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Do NOT create API route handlers for CRUD — use Server Actions
- Do NOT use `localStorage` or `sessionStorage`
- Do NOT add packages unless explicitly listed in this file
- Do NOT use Resend or any email service — Supabase Auth handles emails

### Packages (complete list — install nothing else unless asked)
```bash
npm install @supabase/supabase-js @supabase/ssr zod sonner
```

### Environment Variables (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

The user will fill these in. Create the `.env.local` file with empty values and a comment pointing to Supabase dashboard.

---

## Database Schema

**The user will run this SQL manually in the Supabase SQL Editor.** Create this as a file at `supabase/schema.sql` so it's version controlled, but do NOT try to run it — there is no direct database connection.

```sql
-- ============================================
-- Portfolio Profile Creator — Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL)
-- ============================================

-- Profiles
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  username text not null unique,
  slug text not null unique,
  bio text,
  avatar_url text,
  category text not null default 'developer'
    check (category in ('developer','designer','photographer','writer','marketer','data_scientist','product_manager','other')),
  theme text not null default 'minimal'
    check (theme in ('minimal','bold','elegant','neon','paper','terminal')),
  skills text[] default '{}',
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Social Links
create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  platform text not null,
  url text not null,
  sort_order int default 0
);

-- Projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  url text,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_profiles_slug on public.profiles(slug);
create index idx_profiles_category on public.profiles(category);
create index idx_profiles_created on public.profiles(created_at desc);
create index idx_social_links_profile on public.social_links(profile_id);
create index idx_projects_profile on public.projects(profile_id);

-- Auto-update timestamps
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function update_updated_at();
create trigger projects_updated_at before update on public.projects
  for each row execute function update_updated_at();

-- ============================================
-- Row Level Security
-- ============================================
alter table public.profiles enable row level security;
alter table public.social_links enable row level security;
alter table public.projects enable row level security;

-- Profiles
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (published = true);

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = user_id);

create policy "Users can create own profile"
  on public.profiles for insert with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = user_id);

create policy "Users can delete own profile"
  on public.profiles for delete using (auth.uid() = user_id);

-- Social Links
create policy "Social links viewable with profile"
  on public.social_links for select using (
    exists (select 1 from public.profiles where id = profile_id and (published = true or user_id = auth.uid()))
  );

create policy "Owner can manage social links"
  on public.social_links for all using (
    exists (select 1 from public.profiles where id = profile_id and user_id = auth.uid())
  );

-- Projects
create policy "Projects viewable with profile"
  on public.projects for select using (
    exists (select 1 from public.profiles where id = profile_id and (published = true or user_id = auth.uid()))
  );

create policy "Owner can manage projects"
  on public.projects for all using (
    exists (select 1 from public.profiles where id = profile_id and user_id = auth.uid())
  );
```

Also create `supabase/storage.sql`:

```sql
-- ============================================
-- Storage Buckets — Run in Supabase SQL Editor
-- ============================================

-- Create buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('project-images', 'project-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- Avatar policies
create policy "Anyone can view avatars"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
  on storage.objects for insert with check (
    bucket_id = 'avatars' and auth.role() = 'authenticated'
  );

create policy "Users can update own avatars"
  on storage.objects for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own avatars"
  on storage.objects for delete using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Project image policies (same pattern)
create policy "Anyone can view project images"
  on storage.objects for select using (bucket_id = 'project-images');

create policy "Authenticated users can upload project images"
  on storage.objects for insert with check (
    bucket_id = 'project-images' and auth.role() = 'authenticated'
  );

create policy "Users can update own project images"
  on storage.objects for update using (
    bucket_id = 'project-images' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own project images"
  on storage.objects for delete using (
    bucket_id = 'project-images' and auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Type Generation

Create `lib/database.types.ts` manually with these types. The user can regenerate later with `npx supabase gen types typescript --project-id <id>`, but for now define them by hand to avoid requiring the Supabase CLI.

```ts
export type Profile = {
  id: string
  user_id: string
  username: string
  slug: string
  bio: string | null
  avatar_url: string | null
  category: ProfileCategory
  theme: ThemeName
  skills: string[]
  published: boolean
  created_at: string
  updated_at: string
}

export type SocialLink = {
  id: string
  profile_id: string
  platform: string
  url: string
  sort_order: number
}

export type Project = {
  id: string
  profile_id: string
  title: string
  description: string | null
  url: string | null
  image_url: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type ProfileCategory =
  | 'developer' | 'designer' | 'photographer' | 'writer'
  | 'marketer' | 'data_scientist' | 'product_manager' | 'other'

export type ThemeName =
  | 'minimal' | 'bold' | 'elegant' | 'neon' | 'paper' | 'terminal'

export type ProfileWithRelations = Profile & {
  social_links: SocialLink[]
  projects: Project[]
}
```

---

## File Structure (complete target)

```
├── app/
│   ├── globals.css
│   ├── layout.tsx                      # Root layout: font, Navbar, Toaster
│   ├── page.tsx                        # Landing: hero + recent profiles
│   ├── (auth)/
│   │   ├── layout.tsx                  # Centered card layout
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   └── auth/confirm/route.ts       # Email confirmation callback
│   ├── dashboard/
│   │   ├── layout.tsx                  # requireAuth() guard + sidebar/nav
│   │   ├── page.tsx                    # Profile editor or "create profile" CTA
│   │   └── settings/page.tsx           # Password change, delete account
│   ├── u/[slug]/
│   │   ├── page.tsx                    # Themed public profile
│   │   └── not-found.tsx
│   ├── explore/page.tsx                # Browse + filter by category
│   └── not-found.tsx                   # Global 404
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # createBrowserClient
│   │   ├── server.ts                   # createServerClient (cookies)
│   │   └── proxy.ts                    # updateSession helper
│   ├── auth.ts                         # getUser(), requireAuth()
│   ├── validators.ts                   # All zod schemas
│   ├── constants.ts                    # Categories, themes, platforms metadata
│   ├── storage.ts                      # Upload helpers for avatars/project images
│   └── database.types.ts              # TypeScript types for DB tables
├── actions/
│   ├── auth.ts                         # signUp, signIn, signOut
│   ├── profile.ts                      # createProfile, updateProfile, deleteProfile
│   ├── project.ts                      # addProject, updateProject, removeProject
│   └── social-link.ts                  # saveSocialLinks (upsert pattern)
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── skeleton.tsx
│   │   └── form-field.tsx              # Label + input + error message wrapper
│   ├── layout/
│   │   ├── navbar.tsx
│   │   └── footer.tsx
│   ├── auth/
│   │   ├── sign-in-form.tsx            # "use client" — useActionState
│   │   ├── sign-up-form.tsx            # "use client" — useActionState
│   │   └── user-menu.tsx               # "use client" — sign out button + avatar
│   ├── dashboard/
│   │   ├── profile-form.tsx            # "use client" — main form
│   │   ├── skills-input.tsx            # "use client" — tag-style input
│   │   ├── social-links-editor.tsx     # "use client" — dynamic rows
│   │   ├── project-list-editor.tsx     # "use client" — add/edit/remove projects
│   │   ├── project-card-editor.tsx     # "use client" — single project form
│   │   ├── theme-picker.tsx            # "use client" — visual theme selection
│   │   ├── category-select.tsx
│   │   ├── slug-input.tsx              # "use client" — debounced availability check
│   │   └── avatar-upload.tsx           # "use client" — file upload + preview
│   ├── profile/
│   │   ├── profile-header.tsx          # Avatar + name + category badge
│   │   ├── profile-bio.tsx
│   │   ├── profile-skills.tsx          # Skill badges
│   │   ├── profile-projects.tsx        # Project cards grid
│   │   └── profile-social-links.tsx    # Social icon links
│   └── landing/
│       ├── hero.tsx
│       ├── recent-profiles.tsx         # Server component — fetches recent
│       └── profile-card.tsx            # Card preview for grids
├── proxy.ts                            # Root-level Next.js 16 proxy
├── supabase/
│   ├── schema.sql                      # Database schema + RLS
│   └── storage.sql                     # Storage buckets + policies
├── .env.local
└── next.config.ts
```

---

## Phase 1: Foundation

### Step 1 — Install packages
```bash
npm install @supabase/supabase-js @supabase/ssr zod sonner
```

### Step 2 — Create `.env.local`
```
# Get these from: Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

### Step 3 — Create SQL files
Create `supabase/schema.sql` and `supabase/storage.sql` with the SQL from the "Database Schema" section above. These are reference files for the user to run manually.

### Step 4 — Create Supabase clients

**`lib/supabase/client.ts`** — Browser client:
```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

**`lib/supabase/server.ts`** — Server client (cookies-based):
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — this can be ignored.
            // The proxy will handle session refresh.
          }
        },
      },
    }
  )
}
```

**`lib/supabase/proxy.ts`** — Session refresh helper:
```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session — do NOT use getSession() here
  await supabase.auth.getClaims()

  return supabaseResponse
}
```

### Step 5 — Create root proxy

**`proxy.ts`** (project root, same level as `app/`):
```ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Step 6 — Create auth helpers

**`lib/auth.ts`**:
```ts
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data) return null
  return data.claims
}

export async function requireAuth() {
  const claims = await getUser()
  if (!claims) redirect('/sign-in')
  return claims
}
```

### Step 7 — Create types, validators, constants

Create `lib/database.types.ts` with the types from the "Type Generation" section above.

**`lib/validators.ts`** — All zod schemas:
```ts
import { z } from 'zod'

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const profileSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters').max(50),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  bio: z.string().max(500).optional().nullable(),
  category: z.enum(['developer', 'designer', 'photographer', 'writer', 'marketer', 'data_scientist', 'product_manager', 'other']),
  theme: z.enum(['minimal', 'bold', 'elegant', 'neon', 'paper', 'terminal']),
  skills: z.array(z.string().max(30)).max(20).default([]),
  published: z.boolean().default(true),
})

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional().nullable(),
  url: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  sort_order: z.number().int().default(0),
})

export const socialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url('Must be a valid URL'),
  sort_order: z.number().int().default(0),
})
```

**`lib/constants.ts`**:
```ts
export const CATEGORIES = [
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'writer', label: 'Writer' },
  { value: 'marketer', label: 'Marketer' },
  { value: 'data_scientist', label: 'Data Scientist' },
  { value: 'product_manager', label: 'Product Manager' },
  { value: 'other', label: 'Other' },
] as const

export const THEMES = [
  { value: 'minimal', label: 'Minimal', description: 'Clean and simple' },
  { value: 'bold', label: 'Bold', description: 'Dark and striking' },
  { value: 'elegant', label: 'Elegant', description: 'Warm and refined' },
  { value: 'neon', label: 'Neon', description: 'Cyberpunk glow' },
  { value: 'paper', label: 'Paper', description: 'Classic and warm' },
  { value: 'terminal', label: 'Terminal', description: 'Hacker vibes' },
] as const

export const SOCIAL_PLATFORMS = [
  { value: 'github', label: 'GitHub', icon: 'github' },
  { value: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
  { value: 'twitter', label: 'X (Twitter)', icon: 'twitter' },
  { value: 'website', label: 'Website', icon: 'globe' },
  { value: 'youtube', label: 'YouTube', icon: 'youtube' },
  { value: 'dribbble', label: 'Dribbble', icon: 'dribbble' },
  { value: 'behance', label: 'Behance', icon: 'behance' },
] as const
```

**`lib/storage.ts`** — Upload helpers:
```ts
import { createClient } from '@/lib/supabase/client'

export async function uploadImage(
  bucket: 'avatars' | 'project-images',
  file: File,
  userId: string
) {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return urlData.publicUrl
}
```

### Step 8 — Build UI primitives

Create these files in `components/ui/`. Each should be a simple, reusable Tailwind-styled component. No `"use client"` unless it takes event handlers.

Build these components:
- `button.tsx` — Variants: `default`, `outline`, `ghost`, `destructive`. Props: `variant`, `size`, `disabled`, `loading`
- `input.tsx` — Styled text input with error state
- `textarea.tsx` — Styled textarea with error state
- `select.tsx` — Styled native select with options
- `card.tsx` — Container with border/shadow/padding
- `badge.tsx` — Small pill for categories/skills
- `avatar.tsx` — Round image with fallback initials
- `skeleton.tsx` — Loading placeholder (animated pulse)
- `form-field.tsx` — Wrapper: `<label>` + child input + error message `<p>`

Design guidelines:
- Rounded corners: `rounded-lg` for cards, `rounded-md` for inputs/buttons
- Focus ring: `focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`
- Error state: `border-red-500` on inputs, red text for error messages
- Use teal as the primary accent: `bg-teal-600 hover:bg-teal-700 text-white`
- Disabled state: `opacity-50 cursor-not-allowed`
- Keep all components simple — no complex state, no animations beyond hover/focus

### Step 9 — Update next.config.ts

Add Supabase Storage domain for images:
```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
```

### Step 10 — Verify Phase 1
- `npm run build` passes with zero errors
- All files exist at the paths listed above
- No references to `middleware.ts` anywhere in the codebase
- No references to `ANON_KEY` anywhere
- No Prisma imports or config files

---

## Phase 2: Auth UI

### Step 1 — Create auth Server Actions

**`actions/auth.ts`**:
- `signUp(prevState, formData)` — validates with `signUpSchema`, calls `supabase.auth.signUp()`, returns `{ error }` or `{ success: 'Check email' }`
- `signIn(prevState, formData)` — validates with `signInSchema`, calls `supabase.auth.signInWithPassword()`, redirects to `/dashboard` on success, returns `{ error }` on failure
- `signOut()` — calls `supabase.auth.signOut()`, redirects to `/`

All actions must: import `createClient` from `@/lib/supabase/server`, validate with zod, handle errors gracefully.

### Step 2 — Create auth forms

**`components/auth/sign-up-form.tsx`** — `"use client"`:
- Uses `useActionState(signUp, null)`
- Fields: email, password
- Shows error message from state
- Shows success message ("Check your email")
- Submit button shows loading state via `pending`

**`components/auth/sign-in-form.tsx`** — `"use client"`:
- Uses `useActionState(signIn, null)`
- Fields: email, password
- Shows error message
- Link to sign-up page

### Step 3 — Create auth pages

**`app/(auth)/layout.tsx`** — Centered layout with card wrapper. No `"use client"`.

**`app/(auth)/sign-in/page.tsx`** — Renders `SignInForm`.

**`app/(auth)/sign-up/page.tsx`** — Renders `SignUpForm`.

**`app/(auth)/auth/confirm/route.ts`** — GET handler:
- Extracts `token_hash` and `type` from URL search params
- Calls `supabase.auth.verifyOtp({ type, token_hash })`
- Redirects to `/dashboard` on success, `/sign-in?error=confirmation_failed` on failure

### Step 4 — Build Navbar

**`components/layout/navbar.tsx`** — Server Component:
- Logo/brand name linking to `/`
- Navigation links: Explore
- Auth state: if logged in show `UserMenu`, if not show Sign In / Sign Up links
- Uses `getUser()` from `@/lib/auth` to check auth state

**`components/auth/user-menu.tsx`** — `"use client"`:
- Shows avatar + dropdown with: Dashboard link, Sign Out button
- Sign Out calls the `signOut` action

### Step 5 — Update root layout

**`app/layout.tsx`**:
- Import and render `Navbar`
- Import `Toaster` from `sonner` and render it
- Set up base HTML: lang, meta, font

### Step 6 — Create dashboard layout

**`app/dashboard/layout.tsx`** — Server Component:
- Calls `requireAuth()` at the top — this redirects unauthenticated users
- Renders children inside a dashboard wrapper/container

### Step 7 — Create placeholder dashboard page

**`app/dashboard/page.tsx`** — Server Component:
- Fetches user's profile from Supabase
- If profile exists: show profile editor (placeholder for Phase 3)
- If no profile: show a "Create Your Profile" CTA button/form

### Step 8 — Verify Phase 2
- Navigate to `/sign-up` → create account → check email → confirm → redirected to dashboard
- Navigate to `/sign-in` → sign in with credentials → see dashboard
- Navbar shows user menu when logged in, auth links when not
- Sign out → redirected to home → cannot access `/dashboard` → redirected to sign-in
- Invalid credentials show error message on the form
- `npm run build` passes

---

## Phase 3: Profile CRUD

### Step 1 — Create profile Server Actions

**`actions/profile.ts`**:
- `createProfile(prevState, formData)` — validates with `profileSchema`, checks slug uniqueness, inserts into `profiles` table with `user_id` from `getClaims()`, redirects to `/dashboard`
- `updateProfile(prevState, formData)` — validates, updates where `user_id` matches, calls `revalidatePath('/dashboard')` and `revalidatePath('/u/[slug]')`
- `deleteProfile()` — deletes where `user_id` matches, redirects to `/`

**`actions/project.ts`**:
- `addProject(prevState, formData)` — validates with `projectSchema`, gets `profile_id` from user's profile, inserts into `projects`
- `updateProject(prevState, formData)` — validates, updates by `id` (RLS ensures ownership)
- `removeProject(formData)` — deletes by `id`

**`actions/social-link.ts`**:
- `saveSocialLinks(prevState, formData)` — receives serialized JSON of all links, validates each with `socialLinkSchema`, deletes existing links for the profile, inserts all new ones (replace pattern)

### Step 2 — Build dashboard form components

All of these are `"use client"` components:

**`components/dashboard/profile-form.tsx`**:
- Main form using `useActionState` with `createProfile` or `updateProfile` based on whether profile exists
- Contains: username input, SlugInput, bio textarea, CategorySelect, ThemePicker, SkillsInput, published toggle
- At the bottom: SocialLinksEditor and ProjectListEditor as separate sections
- Submit button with loading state

**`components/dashboard/slug-input.tsx`**:
- Text input for the slug
- On change (debounced 500ms): query Supabase to check if slug is taken
- Show green check or red X indicator
- Display the preview URL: `yoursite.com/u/the-slug`

**`components/dashboard/skills-input.tsx`**:
- Text input + "Add" button or Enter key to add skills
- Renders skills as removable badges below the input
- Stores as a hidden input with JSON array value for form submission
- Max 20 skills

**`components/dashboard/social-links-editor.tsx`**:
- Dynamic list of rows: platform select + URL input + remove button
- "Add Link" button to add a row
- Serializes all links as JSON in a hidden input for form submission

**`components/dashboard/project-list-editor.tsx`**:
- Lists existing projects as cards
- Each card has edit/delete buttons
- "Add Project" opens a project card editor
- Uses separate Server Actions for add/update/remove (not part of the main profile form)

**`components/dashboard/project-card-editor.tsx`**:
- Form for single project: title, description, URL, image upload (Phase 4), sort order
- Uses `useActionState` with `addProject` or `updateProject`

**`components/dashboard/theme-picker.tsx`**:
- Grid of theme preview cards
- Each card shows theme name + color preview
- Selected theme has a highlight border
- Stores selection in a hidden input

**`components/dashboard/category-select.tsx`**:
- Native select dropdown populated from `CATEGORIES` constant

### Step 3 — Update dashboard page

**`app/dashboard/page.tsx`**:
- Fetch the user's profile with relations: `supabase.from('profiles').select('*, social_links(*), projects(*)').eq('user_id', claims.sub).single()`
- If no profile: show `ProfileForm` in create mode
- If profile exists: show `ProfileForm` in edit mode with existing data

### Step 4 — Verify Phase 3
- Create a new profile → fills all fields → saves → data appears in Supabase dashboard
- Edit each field individually → save → changes persist on reload
- Add/remove skills → save → persists
- Add/edit/remove social links → save → persists
- Add/edit/remove projects → save → persists
- Change theme and category → save → persists
- Slug shows availability in real-time
- Delete profile → gone from dashboard and database
- `npm run build` passes

---

## Phase 4: Image Upload

### Step 1 — Avatar upload component

**`components/dashboard/avatar-upload.tsx`** — `"use client"`:
- Shows current avatar or placeholder
- Click to open file picker (accept images only)
- On file select: upload via `uploadImage('avatars', file, userId)` from `lib/storage.ts`
- Show upload progress/loading state
- After upload: update the profile's `avatar_url` via a Server Action
- Show preview of new avatar immediately

### Step 2 — Project image upload

Update `components/dashboard/project-card-editor.tsx`:
- Add image upload field using same pattern as avatar
- Uses `uploadImage('project-images', file, userId)`
- Shows image preview

### Step 3 — Verify Phase 4
- Upload avatar → shows in dashboard → shows on public profile
- Upload project image → shows in project card
- Large files (>2MB for avatars, >5MB for projects) are rejected
- Non-image files are rejected
- `npm run build` passes

---

## Phase 5: Public Profile + Themes

### Step 1 — Add theme CSS variables to `globals.css`

```css
/* Theme variables — only applied on public profile pages */
.theme-minimal  { --profile-bg: #ffffff; --profile-text: #1a1a1a; --profile-accent: #3b82f6; --profile-muted: #6b7280; --profile-border: #e5e7eb; --profile-card-bg: #f9fafb; }
.theme-bold     { --profile-bg: #1a1a2e; --profile-text: #eaeaea; --profile-accent: #e94560; --profile-muted: #a0a0b0; --profile-border: #2a2a4e; --profile-card-bg: #16213e; }
.theme-elegant  { --profile-bg: #faf8f5; --profile-text: #2c2c2c; --profile-accent: #8b7355; --profile-muted: #8a8680; --profile-border: #e0dcd5; --profile-card-bg: #f0ece4; }
.theme-neon     { --profile-bg: #0a0a0a; --profile-text: #00ff88; --profile-accent: #ff00ff; --profile-muted: #00cc66; --profile-border: #1a1a2e; --profile-card-bg: #111111; }
.theme-paper    { --profile-bg: #f5f0e8; --profile-text: #333333; --profile-accent: #c0392b; --profile-muted: #777777; --profile-border: #d5cfc5; --profile-card-bg: #ede8de; }
.theme-terminal { --profile-bg: #1e1e1e; --profile-text: #00ff00; --profile-accent: #ffff00; --profile-muted: #00cc00; --profile-border: #333333; --profile-card-bg: #2a2a2a; }
```

### Step 2 — Build profile display components

All Server Components (no `"use client"`), styled with `var(--profile-*)` CSS variables:

- **`components/profile/profile-header.tsx`** — Avatar, username, category badge, bio
- **`components/profile/profile-skills.tsx`** — Skill badges in a flex wrap
- **`components/profile/profile-projects.tsx`** — Project cards in a grid (image, title, description, link)
- **`components/profile/profile-social-links.tsx`** — Row of social platform icons/links

### Step 3 — Create public profile page

**`app/u/[slug]/page.tsx`**:
- Fetches profile with relations by slug where `published = true`
- If not found: `notFound()`
- Wraps content in a div with the theme class: `<div className={`theme-${profile.theme}`}>`
- Renders all profile display components
- Styles the wrapper with CSS variable values for background, text color, etc.

**`app/u/[slug]/not-found.tsx`** — Simple "Profile not found" page.

Add `generateMetadata` for SEO:
```ts
export async function generateMetadata({ params }) {
  // Fetch profile, return title, description, openGraph image
}
```

### Step 4 — Verify Phase 5
- Visit `/u/some-slug` → profile renders with correct data
- Each theme looks distinctly different
- Change theme in dashboard → public page updates
- Non-existent slug shows 404
- Unpublished profile shows 404 to public visitors
- Page has proper meta tags (check with view-source)
- `npm run build` passes

---

## Phase 6: Landing + Explore

### Step 1 — Build landing page components

**`components/landing/hero.tsx`** — Server Component:
- Headline, subtitle, CTA buttons (Sign Up, Explore)
- Brief description of the platform

**`components/landing/profile-card.tsx`** — Server Component:
- Compact card: avatar, username, category badge, skills preview (max 3)
- Entire card links to `/u/[slug]`

**`components/landing/recent-profiles.tsx`** — Server Component:
- Fetches 8 most recent published profiles
- Renders as a grid of `ProfileCard`

### Step 2 — Update landing page

**`app/page.tsx`**:
- Hero section
- Recent profiles section
- Footer

### Step 3 — Build explore page

**`app/explore/page.tsx`** — Server Component:
- Reads `category` from URL search params for filtering
- Category filter tabs/buttons at the top (links to `?category=developer` etc.)
- Grid of profile cards
- Simple pagination: "Load more" or "Next/Previous" using cursor-based pagination on `created_at`

### Step 4 — Verify Phase 6
- Landing page shows hero + recent profiles
- Profile cards link to correct public profiles
- Explore page shows all profiles
- Category filter works
- Pagination loads more profiles
- Empty states look good ("No profiles yet")
- `npm run build` passes

---

## Phase 7: Polish

### Step 1 — Loading states
- Add `app/dashboard/loading.tsx` with skeleton UI
- Add `app/u/[slug]/loading.tsx` with skeleton UI
- Add `app/explore/loading.tsx` with skeleton UI

### Step 2 — Error handling
- Add `app/error.tsx` — Global error boundary with retry button
- Add `app/dashboard/error.tsx` — Dashboard-specific error boundary
- Add `app/not-found.tsx` — Global 404 page

### Step 3 — Toast notifications
- Add success/error toasts after profile saves, project adds/removes, image uploads
- Use `sonner`: `toast.success('Profile updated')`, `toast.error('Something went wrong')`
- Import `toast` from `sonner` in client components that call actions

### Step 4 — Responsive design
- Test all pages at mobile (375px), tablet (768px), desktop (1280px)
- Navbar: hamburger menu on mobile
- Profile form: single column on mobile
- Profile cards grid: 1 col mobile, 2 col tablet, 3-4 col desktop
- Public profile: adapt layout for mobile

### Step 5 — SEO
- `app/robots.ts` — Allow all crawlers, point to sitemap
- `app/sitemap.ts` — Dynamic sitemap: fetch all published profile slugs, generate URLs
- Ensure all pages have proper `<title>` and `<meta description>`

### Step 6 — Build footer
**`components/layout/footer.tsx`** — Simple footer with links and copyright.

### Step 7 — Final verification
- `npm run build` — zero errors, zero warnings
- `npm run lint` — clean
- All pages render correctly
- Auth flow is complete
- CRUD operations all work
- Images upload and display
- Themes work correctly
- Mobile responsive
- SEO metadata present
- Loading and error states exist

---

## Security Checklist (verify at the end)

- [ ] `next` version is 16.0.10 or later in `package.json`
- [ ] `proxy.ts` exists at project root — no `middleware.ts`
- [ ] All server-side auth uses `getClaims()` — search codebase for `getSession` and confirm zero server-side usage
- [ ] RLS is enabled on all 3 tables
- [ ] `SUPABASE_SECRET_KEY` is never used in client-side code (never has `NEXT_PUBLIC_` prefix)
- [ ] All Server Actions validate input with zod before database operations
- [ ] Storage buckets have file size limits and MIME type restrictions
- [ ] No `any` types in TypeScript