# Data Model: Profile CRUD

**Feature**: 002-profile-crud | **Date**: 2026-03-12

## Entities

### Profile

Represents a user's portfolio identity. One profile per user account.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | |
| user_id | UUID | FK → auth.users(id), unique, not null, cascade delete | One profile per user |
| username | text | not null, 2-50 chars | Display name shown on profile |
| slug | text | not null, unique, 2-50 chars, lowercase alphanumeric + hyphens | URL path: `/u/{slug}` |
| bio | text | nullable, max 500 chars | Optional profile description |
| avatar_url | text | nullable | Public URL from Supabase Storage |
| category | text | not null, default 'developer' | CHECK: developer, designer, photographer, writer, marketer, data_scientist, product_manager, other |
| theme | text | not null, default 'minimal' | CHECK: minimal, bold, elegant, neon, paper, terminal |
| skills | text[] | default '{}', max 20 items, max 30 chars each | PostgreSQL array, validated at app layer |
| published | boolean | default true | Controls public visibility |
| created_at | timestamptz | default now() | |
| updated_at | timestamptz | default now() | Auto-updated via trigger |

**Indexes**: slug (unique), category, created_at DESC

**RLS Policies**:
- SELECT: Anyone can view published profiles; owners can view their own
- INSERT: Only if auth.uid() = user_id
- UPDATE: Only if auth.uid() = user_id
- DELETE: Only if auth.uid() = user_id

### Social Link

A link to an external platform associated with a profile.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | |
| profile_id | UUID | FK → profiles(id), not null, cascade delete | |
| platform | text | not null | One of: github, linkedin, twitter, website, youtube, dribbble, behance |
| url | text | not null, valid URL | |
| sort_order | int | default 0 | Display ordering |

**RLS Policies**:
- SELECT: Visible if parent profile is published or user is owner
- ALL (insert/update/delete): Only if user owns the parent profile

### Project

A portfolio work item associated with a profile.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | |
| profile_id | UUID | FK → profiles(id), not null, cascade delete | |
| title | text | not null, 1-100 chars | |
| description | text | nullable, max 500 chars | |
| url | text | nullable, valid URL | External link to the project |
| image_url | text | nullable | Public URL from Supabase Storage |
| sort_order | int | default 0 | Display ordering |
| created_at | timestamptz | default now() | |
| updated_at | timestamptz | default now() | Auto-updated via trigger |

**Indexes**: profile_id

**RLS Policies**:
- SELECT: Visible if parent profile is published or user is owner
- ALL (insert/update/delete): Only if user owns the parent profile

## Relationships

```
auth.users (1) ──── (0..1) profiles
profiles   (1) ──── (0..N) social_links
profiles   (1) ──── (0..N) projects
```

## State Transitions

### Profile Visibility
- `published: true` (default) → Profile visible on public pages and explore
- `published: false` → Profile hidden from public; only visible to owner in dashboard

### Profile Lifecycle
1. **No profile** → User sees "Create Your Profile" CTA on dashboard
2. **Created** → Profile exists, form switches to edit mode
3. **Deleted** → Returns to state 1; social links and projects cascade-deleted

## Storage Buckets

### avatars
- Public read, authenticated write
- Max file size: 2MB
- Allowed MIME types: image/jpeg, image/png, image/webp
- Path pattern: `{user_id}/{timestamp}.{ext}`
- Write/update/delete restricted to files in user's own folder

### project-images
- Public read, authenticated write
- Max file size: 5MB
- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
- Path pattern: `{user_id}/{timestamp}.{ext}`
- Write/update/delete restricted to files in user's own folder

## Validation Rules (Zod Schemas)

### profileSchema
- username: string, min 2, max 50
- slug: string, min 2, max 50, regex `/^[a-z0-9-]+$/`
- bio: string, max 500, optional/nullable
- category: enum (8 values)
- theme: enum (6 values)
- skills: array of strings (max 30 chars each), max 20 items, default []
- published: boolean, default true

### projectSchema
- title: string, min 1, max 100
- description: string, max 500, optional/nullable
- url: string, valid URL, optional/nullable or empty string
- sort_order: number, integer, default 0

### socialLinkSchema
- platform: string, min 1
- url: string, valid URL
- sort_order: number, integer, default 0
