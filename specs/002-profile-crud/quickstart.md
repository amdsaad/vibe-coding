# Quickstart: Profile CRUD

**Feature**: 002-profile-crud | **Date**: 2026-03-12

## Prerequisites

1. Feature 001 (auth system) is complete and working
2. Supabase project is set up with `.env.local` configured
3. Database schema is applied (run updated `supabase/schema.sql` or migration)
4. Storage buckets created (run `supabase/storage.sql`)
5. `npm run dev` starts without errors

## Manual Test Plan

### Test 1: Create Profile (US1 — P1)

1. Sign in as a user who has no profile
2. Visit `/dashboard` — should see "Create Your Profile" CTA
3. Fill in the form:
   - Username: "Jane Doe"
   - Slug: "jane-doe"
   - Bio: "Full-stack developer"
   - Category: Developer
4. Submit the form
5. **Expected**: Profile is created, form switches to edit mode with data pre-filled
6. Reload the page — data should persist

### Test 2: Slug Validation (US1 + US8 — P1/P2)

1. In the profile form, type a slug and pause
2. **Expected**: After ~500ms, a green check or red X appears
3. Try a slug you know is taken (create a second account and use its slug)
4. **Expected**: Red X indicator, and server-side validation also rejects on submit
5. Try invalid slugs: "My Slug" (uppercase), "my slug" (spaces), "my@slug" (special chars)
6. **Expected**: Validation error explaining allowed characters
7. Check the URL preview below the slug input shows `/u/jane-doe`

### Test 3: Edit Profile (US2 — P1)

1. With an existing profile, visit `/dashboard`
2. Change the username to something else
3. Select a different theme (e.g., "Terminal")
4. Toggle published off
5. Save
6. **Expected**: Success feedback appears, changes persist on reload

### Test 4: Manage Skills (US3 — P2)

1. In the profile editor, find the skills input
2. Type "React" and press Enter — badge should appear
3. Type "TypeScript" and press Enter — second badge appears
4. Click remove on "React" — badge disappears
5. Try adding "React" again — should work (it was removed)
6. Try adding "TypeScript" again — should be prevented (duplicate)
7. Save the profile, reload — skills persist
8. Try adding skills until you reach 20, then try one more — should be prevented

### Test 5: Manage Social Links (US4 — P2)

1. Click "Add Link" — a new row appears with platform dropdown and URL input
2. Select "GitHub" and enter a valid GitHub URL
3. Click "Add Link" again — second row appears
4. Select "LinkedIn" and enter a valid LinkedIn URL
5. Remove the first link (GitHub)
6. Save the profile
7. Reload — only the LinkedIn link should appear
8. Try saving with an invalid URL — validation error should appear

### Test 6: Manage Projects (US5 — P2)

1. Click "Add Project"
2. Fill in: Title "My App", Description "A cool app", URL "https://example.com"
3. Save the project — it should appear as a card
4. Click edit on the project card, change the title
5. Save — title updates
6. Click delete on the project — it should be removed
7. Try adding a project with no title — validation error should appear

### Test 7: Avatar Upload (US6 — P3)

1. Click the avatar upload area
2. Select a JPEG image under 2MB
3. **Expected**: Preview appears immediately
4. Save the profile, reload — avatar persists
5. Try uploading a file > 2MB — should be rejected with error
6. Try uploading a non-image file — should be rejected with error
7. Upload a new avatar — old preview replaced with new one

### Test 8: Project Image Upload (US7 — P3)

1. Edit a project
2. Upload a JPEG/PNG/WebP/GIF image under 5MB
3. **Expected**: Preview appears
4. Save the project, reload — image persists
5. Try uploading > 5MB — should be rejected

### Test 9: Delete Profile (US9 — P3)

1. With an existing profile (with projects and social links), find the delete option
2. Click delete — confirmation should appear
3. Cancel — profile should remain intact
4. Click delete again, confirm
5. **Expected**: Profile, all social links, and all projects are removed
6. Dashboard shows "Create Your Profile" CTA again

### Test 10: Auth Guard

1. Sign out
2. Try navigating to `/dashboard` directly
3. **Expected**: Redirected to `/sign-in`

## Build Verification

```bash
npm run build
```

Must complete with zero errors. Verify:
- No `any` types
- No references to `middleware.ts`
- No references to `getSession()` on server
- No references to `ANON_KEY`
