# Quickstart: Authentication System

**Feature**: 001-auth-system
**Date**: 2026-03-12

## Prerequisites

1. Node.js 18+ installed
2. Supabase project created (get URL and keys from Dashboard → Project Settings → API)
3. Database schema applied: run `supabase/schema.sql` in Supabase SQL Editor
4. Packages installed: `npm install @supabase/supabase-js @supabase/ssr zod sonner`
5. `.env.local` populated:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
   SUPABASE_SECRET_KEY=<your-secret-key>
   ```

## Running the App

```bash
npm run dev
```

Open http://localhost:3000

## Testing the Auth Flow

### 1. Sign Up
- Navigate to `/sign-up`
- Enter email and password (8+ characters)
- Submit → see "Check your email" message
- Check email inbox → click confirmation link
- Should redirect to `/dashboard`

### 2. Sign In
- Navigate to `/sign-in`
- Enter registered credentials
- Submit → should redirect to `/dashboard`
- Try invalid credentials → should see "Invalid email or password"

### 3. Dashboard
- While signed in, visit `/dashboard`
- Should see "Create Your Profile" CTA (no profile created yet)
- Sign out → try visiting `/dashboard` → should redirect to `/sign-in`

### 4. Navbar
- While signed out: navbar shows Sign In / Sign Up links
- While signed in: navbar shows user menu with email initial avatar
- Click user menu → see Dashboard link and Sign Out button

### 5. Auth Page Redirect
- While signed in, visit `/sign-in` → should redirect to `/dashboard`
- While signed in, visit `/sign-up` → should redirect to `/dashboard`

## Build Verification

```bash
npm run build
```

Must complete with zero errors.

## Key Files

| File | Purpose |
|------|---------|
| `proxy.ts` | Session refresh on every request |
| `lib/auth.ts` | `getUser()` and `requireAuth()` helpers |
| `actions/auth.ts` | `signUp`, `signIn`, `signOut` Server Actions |
| `app/(auth)/auth/confirm/route.ts` | Email confirmation callback |
| `app/dashboard/layout.tsx` | Route guard via `requireAuth()` |
| `components/auth/user-menu.tsx` | Avatar dropdown with sign-out |
