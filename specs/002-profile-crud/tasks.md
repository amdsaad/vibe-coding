# Tasks: Profile CRUD

**Input**: Design documents from `/specs/002-profile-crud/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: No automated tests requested. Manual verification per quickstart.md. `npm run build` as build gate.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Schema Alignment)

**Purpose**: Align existing database schema, types, validators, and constants to the plan.md spec. This is required because the existing codebase was built from an earlier iteration with different field names, categories, and themes.

- [x] T001 [P] Update `supabase/schema.sql` to match plan.md exactly: rename `display_name` → `username`, rename existing `username` → `slug`, rename `is_published` → `published`, add `skills text[] default '{}'` column, add CHECK constraints for category (developer/designer/photographer/writer/marketer/data_scientist/product_manager/other) and theme (minimal/bold/elegant/neon/paper/terminal), add `update_updated_at()` trigger function on profiles and projects, add indexes on `slug`, `category`, `created_at desc`
- [x] T002 [P] Create `supabase/migrations/002-align-schema.sql` with ALTER TABLE statements for users who already have the old schema deployed: rename columns, add `skills` column, update default values, add CHECK constraints, add triggers, add indexes
- [x] T003 [P] Update `lib/database.types.ts` to match plan.md: rename `display_name` → remove it, rename `is_published` → `published`, add `slug: string` field, add `skills: string[]` field, update `ProfileCategory` type (remove creative/musician/filmmaker, add marketer/data_scientist/product_manager), update `ThemeName` type (remove playful/dark, add neon/paper/terminal), remove `created_at` from `SocialLink` type
- [x] T004 [P] Update `lib/validators.ts` to match plan.md: update `profileSchema` to use `username` (min 2, max 50), add `slug` field (min 2, max 50, regex `/^[a-z0-9-]+$/`), add `skills` (array of strings max 30 chars, max 20 items), add `published` (boolean), add `theme` with updated enum, add `category` with updated enum, add `avatar_url` (optional URL string or empty string), add `sort_order` to `projectSchema` and `socialLinkSchema`
- [x] T005 [P] Update `lib/constants.ts` to match plan.md: update `CATEGORIES` (replace creative/musician/filmmaker with marketer/data_scientist/product_manager), update `THEMES` (replace playful/dark with neon/paper/terminal, add description field to each), update `SOCIAL_PLATFORMS` (remove instagram/tiktok, keep github/twitter/linkedin/dribbble/behance/youtube/website)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Server Actions, storage helper, missing UI primitives, and theme CSS variables that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 [P] Create `lib/storage.ts` — `uploadImage(bucket, file, userId)` function using `createBrowserClient` from `@/lib/supabase/client`: uploads file to `{userId}/{timestamp}.{ext}` path, returns public URL via `getPublicUrl()`, upserts to allow replacement (per plan.md Phase 4)
- [x] T007 [P] Create `components/ui/textarea.tsx` — styled textarea with error state (`border-red-500`), teal functional focus ring (`focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`), `rounded-md`, disabled state
- [x] T008 [P] Create `components/ui/select.tsx` — styled native `<select>` with options, error state, teal focus ring, `rounded-md`
- [x] T009 [P] Create `components/ui/badge.tsx` — small pill component for categories/skills, variants for removable (with X button) and static display, `rounded-full`
- [x] T010 [P] Create `components/ui/avatar.tsx` — round image with fallback initials, uses `next/image` for optimization, sizes: sm/md/lg
- [x] T011 [P] Create `components/ui/skeleton.tsx` — loading placeholder with animated pulse, variants for text/circle/rectangle
- [x] T012 [P] Update `app/globals.css` — add theme CSS variable classes if not already present: `.theme-minimal`, `.theme-bold`, `.theme-elegant`, `.theme-neon`, `.theme-paper`, `.theme-terminal` with `--profile-bg`, `--profile-text`, `--profile-accent`, `--profile-muted`, `--profile-border`, `--profile-card-bg` variables (per plan.md Phase 5 Step 1)
- [x] T013 Create `actions/profile.ts` — three Server Actions using `createClient` from `@/lib/supabase/server`: (1) `createProfile(prevState, formData)` — validates with `profileSchema`, gets user via `getClaims()`, checks slug uniqueness, inserts into `profiles` with `user_id` from claims `.sub`, calls `revalidatePath('/dashboard')`, returns `{ error }` or `{ success }`. (2) `updateProfile(prevState, formData)` — validates with `profileSchema`, updates where `user_id` matches, calls `revalidatePath('/dashboard')` and `revalidatePath('/u/' + slug)`, returns `{ error }` or `{ success }`. (3) `deleteProfile()` — deletes where `user_id` matches (cascade removes social_links and projects via FK), calls `revalidatePath('/')`, redirects to `/dashboard`. Social links are saved atomically inside `updateProfile`/`createProfile`: parse JSON from hidden `social_links` form field, delete existing links for profile, insert all new links (depends on T003, T004)
- [x] T014 [P] Create `actions/project.ts` — three Server Actions: (1) `addProject(prevState, formData)` — validates with `projectSchema`, gets user's `profile_id` via `getClaims()` + profiles query, inserts into `projects`, calls `revalidatePath('/dashboard')`. (2) `updateProject(prevState, formData)` — validates, updates by `id` (RLS ensures ownership), calls `revalidatePath('/dashboard')`. (3) `removeProject(formData)` — deletes by `id` from hidden input, calls `revalidatePath('/dashboard')` (depends on T003, T004)
- [x] T015 [P] Create `actions/social-link.ts` — export a `saveSocialLinks(supabase, profileId, links)` **helper function** (not a Server Action): validates each link with `socialLinkSchema`, deletes all existing social_links for the given profile, inserts all new links. Called internally by `createProfile` and `updateProfile` in `actions/profile.ts` to save social links atomically as part of the profile form submission (depends on T003, T004)

- [x] T015b [P] Verify/create Supabase Storage buckets `avatars` and `project-images` in `supabase/storage.sql`: public read, authenticated write, size limits (2MB avatars, 5MB project-images), allowed MIME types, RLS policies restricting write/update/delete to user's own folder (`{user_id}/`). Apply via Supabase MCP or SQL migration.
- [x] T015c [P] Update `next.config.ts` — add Supabase Storage domain to `images.remotePatterns` so `next/image` can serve avatar and project images (required by T010 avatar component using `next/image`)

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 + 2 — Create & Edit Profile (Priority: P1)

**Goal**: Authenticated users can create a new profile and edit existing profile data including username, slug, bio, category, theme, and published toggle

**Independent Test**: Sign in as a new user → see create form → fill fields → submit → profile created → form switches to edit mode → modify fields → save → changes persist on reload

### Implementation for User Stories 1 & 2

- [x] T016 [P] [US1] Create `components/dashboard/category-select.tsx` — native `<select>` using `Select` UI component, populated from `CATEGORIES` constant, receives `defaultValue` prop for edit mode, renders with design system styling (JetBrains Mono, uppercase label)
- [x] T017 [P] [US1] Create `components/dashboard/theme-picker.tsx` — `"use client"`, grid of theme preview cards (3 columns), each card shows theme name + description + color swatch preview using the theme CSS variables, selected theme has teal highlight border (`border-teal-500`), stores selection in a hidden `<input name="theme">`, receives `defaultValue` prop for edit mode
- [x] T018 [US1] Create `components/dashboard/profile-form.tsx` — `"use client"`, main form using `useActionState` with `createProfile` (create mode) or `updateProfile` (edit mode) based on `profile` prop presence. Fields: username `Input`, slug (plain `Input` for now — enhanced in US8), bio `Textarea`, `CategorySelect`, `ThemePicker`, published toggle (checkbox), hidden input for `skills` (JSON, enhanced in US3), hidden input for `social_links` (JSON, enhanced in US4). Submit `Button` with pending/loading state. Shows success/error feedback via `toast` from sonner. Receives optional `profile: ProfileWithRelations` prop for edit mode pre-fill (depends on T007, T008, T013, T016, T017)
- [x] T019 [US1] Update `app/dashboard/page.tsx` — replace placeholder content: fetch profile with relations via `supabase.from('profiles').select('*, social_links(*), projects(*)').eq('user_id', claims.sub).single()`, if no profile render `ProfileForm` in create mode, if profile exists render `ProfileForm` in edit mode passing the profile data (depends on T018)

**Checkpoint**: User Stories 1 & 2 fully functional — create and edit profile with basic fields, theme, and category

---

## Phase 4: User Story 8 — Real-Time Slug Availability (Priority: P2)

**Goal**: Slug input provides real-time availability feedback with debounced checking and URL preview

**Independent Test**: Type a slug in the profile form → wait 500ms → see green check (available) or red X (taken) → see URL preview `/u/the-slug` below input

### Implementation for User Story 8

- [x] T020 [US8] Create `components/dashboard/slug-input.tsx` — `"use client"`, text input for slug with: (1) debounced availability check (500ms) using `createClient` from `@/lib/supabase/client` to query `profiles` table by slug, (2) green checkmark icon if available, red X if taken, loading spinner during check, (3) exclude current user's own slug from "taken" results (receives `currentSlug` prop), (4) preview URL displayed below: `/u/{slug}`, (5) stores value in `<input name="slug">` for form submission. Uses `Input` UI component with additional status indicator (depends on Phase 1 types/validators)
- [x] T021 [US8] Update `components/dashboard/profile-form.tsx` — replace plain slug `Input` with `SlugInput` component, pass `currentSlug={profile?.slug}` for edit mode (depends on T020)

**Checkpoint**: Slug input shows real-time availability and URL preview

---

## Phase 5: User Story 3 — Manage Skills (Priority: P2)

**Goal**: Users can add/remove professional skills as tag badges, max 20, persisted with profile

**Independent Test**: Type a skill → press Enter → badge appears → add more → remove one → save profile → reload → skills persist

### Implementation for User Story 3

- [x] T022 [US3] Create `components/dashboard/skills-input.tsx` — `"use client"`, tag-style input: (1) text input + "Add" button, Enter key also adds, (2) renders skills as `Badge` components with remove (X) button below input, (3) prevents duplicates (case-insensitive check), (4) enforces max 20 skills with message, (5) each skill max 30 chars, (6) stores skills array as JSON in hidden `<input name="skills">` for form submission, receives `defaultValue: string[]` prop for edit mode (depends on T009 from Phase 2)
- [x] T023 [US3] Update `components/dashboard/profile-form.tsx` — replace hidden skills input with `SkillsInput` component, pass `defaultValue={profile?.skills ?? []}` for edit mode (depends on T022)

**Checkpoint**: Skills management works with add/remove/persist

---

## Phase 6: User Story 4 — Manage Social Links (Priority: P2)

**Goal**: Users can add/remove social links with platform selection and URL, saved atomically with profile

**Independent Test**: Click "Add Link" → select platform → enter URL → add another → remove first → save → reload → correct links persist

### Implementation for User Story 4

- [x] T024 [US4] Create `components/dashboard/social-links-editor.tsx` — `"use client"`, dynamic list: (1) each row has platform `Select` (from `SOCIAL_PLATFORMS`) + URL `Input` + remove button, (2) "Add Link" button appends a new empty row, (3) validates URLs on blur (visual feedback only), (4) serializes all links as JSON in hidden `<input name="social_links">` for form submission, (5) receives `defaultValue: SocialLink[]` prop for edit mode (depends on T008 from Phase 2)
- [x] T025 [US4] Update `components/dashboard/profile-form.tsx` — replace hidden social_links input with `SocialLinksEditor` component, pass `defaultValue={profile?.social_links ?? []}` for edit mode (depends on T024)

**Checkpoint**: Social links management works with add/remove/persist atomically

---

## Phase 7: User Story 5 — Manage Projects (Priority: P2)

**Goal**: Users can add, edit, and remove portfolio projects independently from the main profile form

**Independent Test**: Click "Add Project" → fill title/description/URL → save → project card appears → edit title → save → delete project → removed

### Implementation for User Story 5

- [x] T026 [P] [US5] Create `components/dashboard/project-card-editor.tsx` — `"use client"`, form for single project using `useActionState` with `addProject` (new) or `updateProject` (existing): fields for title `Input`, description `Textarea`, URL `Input`, sort_order `Input[type=number]`, image upload placeholder (enhanced in US7). Submit and Cancel buttons. Receives optional `project: Project` prop for edit mode. Shows success/error via toast (depends on T014 from Phase 2)
- [x] T027 [US5] Create `components/dashboard/project-list-editor.tsx` — `"use client"`, lists existing projects as cards with title/description preview, each card has Edit and Delete buttons. Edit toggles inline `ProjectCardEditor` in edit mode. Delete calls `removeProject` Server Action with confirmation (second click pattern). "Add Project" button at bottom opens `ProjectCardEditor` in create mode. Receives `projects: Project[]` and `profileId: string` props (depends on T026)
- [x] T028 [US5] Update `app/dashboard/page.tsx` — add `ProjectListEditor` component below the `ProfileForm`, pass `projects={profile?.projects ?? []}` and `profileId={profile?.id}` (only shown when profile exists) (depends on T027)

**Checkpoint**: Project CRUD works independently from profile form

---

## Phase 8: User Story 6 — Upload Avatar (Priority: P3)

**Goal**: Users can upload a profile avatar image with immediate preview, persisted with profile

**Independent Test**: Click avatar area → select image → preview appears → save → reload → avatar persists → try oversized file → error shown

### Implementation for User Story 6

- [x] T029 [US6] Create `components/dashboard/avatar-upload.tsx` — `"use client"`, (1) shows current avatar via `Avatar` component or placeholder, (2) click opens file picker (`accept="image/jpeg,image/png,image/webp"`), (3) client-side size check (max 2MB) before upload, (4) on file select: calls `uploadImage('avatars', file, userId)` from `lib/storage.ts`, (5) shows loading spinner during upload, (6) on success: displays preview immediately, stores URL in hidden `<input name="avatar_url">`, (7) on error: shows toast with error message. Receives `currentAvatarUrl`, `userId` props (depends on T006, T010 from Phase 2)
- [x] T030 [US6] Update `components/dashboard/profile-form.tsx` — add `AvatarUpload` component at the top of the form, pass `currentAvatarUrl={profile?.avatar_url}` and `userId` from claims, add `avatar_url` to form submission data (depends on T029)
- [x] T031 [US6] Update `actions/profile.ts` — ensure `createProfile` and `updateProfile` accept and save `avatar_url` from formData (depends on T029)

**Checkpoint**: Avatar upload works with preview and persistence

---

## Phase 9: User Story 7 — Upload Project Images (Priority: P3)

**Goal**: Users can attach an image to each project with preview and persistence

**Independent Test**: Edit project → upload image → preview appears → save → reload → image persists → try oversized file → error

### Implementation for User Story 7

- [x] T032 [US7] Update `components/dashboard/project-card-editor.tsx` — add image upload section: (1) click area opens file picker (`accept="image/jpeg,image/png,image/webp,image/gif"`), (2) client-side size check (max 5MB), (3) calls `uploadImage('project-images', file, userId)`, (4) shows preview, (5) stores URL in hidden `<input name="image_url">`, receives `userId` prop (depends on T006 from Phase 2)
- [x] T033 [US7] Update `actions/project.ts` — ensure `addProject` and `updateProject` accept and save `image_url` from formData (depends on T032)

**Checkpoint**: Project images upload and persist correctly

---

## Phase 10: User Story 9 — Delete Profile (Priority: P3)

**Goal**: Users can permanently delete their profile with confirmation, cascading to social links and projects

**Independent Test**: With existing profile → click delete → confirm → profile removed → dashboard shows create CTA → cancel works

### Implementation for User Story 9

- [x] T034 [US9] Create a delete profile section in `app/dashboard/page.tsx` or within `components/dashboard/profile-form.tsx` — "use client" button component with two-click confirmation pattern: first click changes button text to "Confirm Delete" with destructive styling (`bg-red-600`), second click calls `deleteProfile` Server Action. Only shown when profile exists. Include a cancel/reset after 3 seconds if second click not made (depends on T013 from Phase 2)

**Checkpoint**: Delete profile with confirmation works, cascades to related data

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Build verification and compliance checks

- [x] T035 Run `npm run build` and verify zero errors
- [x] T036 Verify no prohibited patterns exist: search codebase for `middleware.ts`, `getSession()` on server, `ANON_KEY`, `react-hook-form`, `any` type usage — must find zero matches. Verify all Server Actions validate with Zod before database operations. Verify `revalidatePath()` is called after every mutation. Verify all buttons use `rounded-full` pill shape per Constitution Principle X.
- [x] T037 Run through quickstart.md manual test plan (all 10 test scenarios) and verify all acceptance criteria pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (aligned types/validators) — BLOCKS all user stories
- **US1+US2 (Phase 3)**: Depends on Phase 2 completion
- **US8 (Phase 4)**: Depends on Phase 3 (profile-form.tsx exists to update)
- **US3 (Phase 5)**: Depends on Phase 3 (profile-form.tsx exists to update)
- **US4 (Phase 6)**: Depends on Phase 3 (profile-form.tsx exists to update)
- **US5 (Phase 7)**: Depends on Phase 2 completion (independent of profile form)
- **US6 (Phase 8)**: Depends on Phase 3 (profile-form.tsx exists to update)
- **US7 (Phase 9)**: Depends on Phase 7 (project-card-editor.tsx exists to update)
- **US9 (Phase 10)**: Depends on Phase 3 (dashboard page exists)
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

- **US1+US2 (P1)**: Can start after Phase 2 — creates profile-form.tsx used by later stories
- **US8 (P2)**: Depends on US1+US2 — enhances slug input in profile-form
- **US3 (P2)**: Depends on US1+US2 — enhances skills input in profile-form
- **US4 (P2)**: Depends on US1+US2 — enhances social links in profile-form
- **US5 (P2)**: Can start after Phase 2 — independent component (project-list-editor)
- **US6 (P3)**: Depends on US1+US2 — adds avatar upload to profile-form
- **US7 (P3)**: Depends on US5 — adds image upload to project-card-editor
- **US9 (P3)**: Depends on US1+US2 — adds delete to dashboard

### Within Each User Story

- Components before page updates (pages import components)
- Server Actions must exist before client forms that call them (handled by Phase 2)

### Parallel Opportunities

- T001, T002, T003, T004, T005 can all run in parallel (Phase 1 — different files)
- T006, T007, T008, T009, T010, T011, T012 can all run in parallel (Phase 2 — different files)
- T013, T014, T015 can run in parallel with each other (Phase 2 — different action files)
- T016, T017 can run in parallel (Phase 3 — different components)
- US3 (T022-T023), US4 (T024-T025), US8 (T020-T021) can run in parallel after Phase 3
- US5 (T026-T028) can run in parallel with US3/US4/US8 after Phase 2

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Schema Alignment
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Stories 1 + 2 (Create & Edit Profile)
4. **STOP and VALIDATE**: Create a profile, edit it, verify persistence
5. This delivers a working profile editor without skills, links, projects, or images

### Full Delivery

1. Complete Schema Alignment + Foundational → Foundation ready
2. Add US1+US2 (Create/Edit) → Test create/edit flow (MVP!)
3. Add US8 (Slug Check) → Test real-time availability
4. Add US3 (Skills) + US4 (Social Links) in parallel → Test skills and links
5. Add US5 (Projects) → Test project CRUD
6. Add US6 (Avatar) + US7 (Project Images) → Test uploads
7. Add US9 (Delete) → Test cascade deletion
8. Polish → Build verification + compliance check
9. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable (after its dependencies)
- US1+US2 are combined because they share the same form component (create vs edit mode)
- Profile form handles skills and social links via hidden JSON inputs initially, then enhanced with dedicated components in US3/US4
- Projects are independent from the profile form — separate components and actions
- Commit after each phase completion
- Stop at any checkpoint to validate story independently
