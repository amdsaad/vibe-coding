# Implementation Plan: Profile CRUD

**Branch**: `002-profile-crud` | **Date**: 2026-03-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-profile-crud/spec.md`

## Summary

Implement full profile CRUD on the dashboard: create/edit/delete profiles with skills, social links, projects, and image uploads. Uses Server Actions with Zod validation, `useActionState` for forms, and Supabase Storage for images. Requires schema alignment — existing database and types diverge from the plan.md spec and must be updated first.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.2, Next.js 16.0.10+
**Primary Dependencies**: @supabase/supabase-js, @supabase/ssr, zod, sonner
**Storage**: Supabase PostgreSQL (via RLS) + Supabase Storage (avatars, project-images buckets)
**Testing**: Manual testing per quickstart.md, `npm run build` as build gate
**Target Platform**: Web (desktop + mobile responsive)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Form saves < 2s visible feedback, slug check < 1s, image preview < 3s
**Constraints**: No ORM, no UI libraries, no additional packages, Server Actions only (no API routes)
**Scale/Scope**: Single-user profile per account, ~20 skills max, ~7 social link platforms, unlimited projects

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Server-First Rendering | PASS | Dashboard page is Server Component; client components only for interactive forms |
| II. Server Actions for Mutations | PASS | All mutations in `actions/profile.ts`, `actions/project.ts`, `actions/social-link.ts` |
| III. Proxy-Based Session Management | PASS | No middleware.ts; proxy.ts exists at root |
| IV. Auth via getClaims() | PASS | All server actions use getClaims() via requireAuth/getUser |
| V. Direct Supabase Queries with RLS | PASS | Supabase client directly; RLS handles authorization |
| VI. useActionState for Forms | PASS | All forms use useActionState from React 19 |
| VII. No UI Component Libraries | PASS | Hand-built components in components/ui/ |
| VIII. Strict Package Policy | PASS | No new packages needed |
| IX. TypeScript Strict Mode | PASS | No `any` types |
| X. Design System Adherence | PASS | Teal functional accent for forms, red brand accent for CTAs, Space Grotesk headings, JetBrains Mono body |

No violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/002-profile-crud/
├── plan.md              # This file
├── research.md          # Schema alignment decisions
├── data-model.md        # Entity definitions aligned to plan.md
├── quickstart.md        # Manual testing guide
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
# Files to CREATE
actions/
├── profile.ts             # createProfile, updateProfile, deleteProfile
├── project.ts             # addProject, updateProject, removeProject
└── social-link.ts         # saveSocialLinks helper (atomic replace, called by profile actions)

lib/
└── storage.ts             # uploadImage helper (client-side)

components/
├── dashboard/
│   ├── profile-form.tsx        # Main profile form (use client)
│   ├── slug-input.tsx          # Debounced slug check (use client)
│   ├── skills-input.tsx        # Tag-style skill input (use client)
│   ├── social-links-editor.tsx # Dynamic link rows (use client)
│   ├── project-list-editor.tsx # Project cards list (use client)
│   ├── project-card-editor.tsx # Single project form (use client)
│   ├── theme-picker.tsx        # Visual theme selection (use client)
│   ├── category-select.tsx     # Category dropdown (server or client)
│   └── avatar-upload.tsx       # File upload + preview (use client)
└── ui/
    ├── textarea.tsx            # Styled textarea (if not exists)
    ├── select.tsx              # Styled native select (if not exists)
    ├── badge.tsx               # Skill/category badges (if not exists)
    ├── avatar.tsx              # Round image with fallback (if not exists)
    └── skeleton.tsx            # Loading placeholder (if not exists)

# Files to UPDATE
lib/database.types.ts      # Align types to plan.md schema
lib/validators.ts          # Align schemas to plan.md spec
lib/constants.ts           # Align categories, themes, platforms to plan.md
supabase/schema.sql        # Align to plan.md schema (slug, skills, etc.)
app/dashboard/page.tsx     # Replace placeholder with ProfileForm
app/globals.css            # Add theme CSS variables (if not present)
next.config.ts             # Verify Supabase Storage image patterns
```

**Structure Decision**: Next.js App Router convention — `actions/` for Server Actions, `components/` for UI, `lib/` for utilities. No separate backend/frontend split. All new dashboard components go in `components/dashboard/`.

## Schema Alignment Strategy

The existing database schema and TypeScript types diverge from the authoritative plan.md. The following changes are required BEFORE any CRUD implementation:

### Database Changes Required

| Change | Existing | Plan.md Target |
|--------|----------|----------------|
| Add `slug` column | Not present | `slug text not null unique` |
| Add `skills` column | Not present | `skills text[] default '{}'` |
| Rename `display_name` → `username` | `display_name text not null` | `username text not null` |
| Rename existing `username` → `slug` | `username text unique not null` | `slug text not null unique` |
| Rename `is_published` → `published` | `is_published boolean` | `published boolean default true` |
| Update category CHECK | No constraint | CHECK with plan.md categories |
| Update theme CHECK | No constraint | CHECK with plan.md themes |
| Add `update_updated_at` trigger | Not present | Trigger on profiles + projects |
| Add missing indexes | `username`, `user_id` | `slug`, `category`, `created_at desc` |

### Approach

1. Update `supabase/schema.sql` to match plan.md exactly
2. Create a migration SQL file for existing databases (`supabase/migrations/002-align-schema.sql`)
3. Update `lib/database.types.ts` to match
4. Update `lib/validators.ts` to match
5. Update `lib/constants.ts` to match
6. Update any existing code referencing old field names

## Complexity Tracking

> No violations to justify — all constitution gates pass.
