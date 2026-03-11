# Tasks: Authentication System

**Input**: Design documents from `/specs/001-auth-system/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: No automated tests requested. Manual verification per quickstart.md. `npm run build` as build gate.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Install dependencies and create configuration files

- [x] T001 Install packages: `npm install @supabase/supabase-js @supabase/ssr zod sonner`
- [x] T002 [P] Create `.env.local` with empty Supabase env vars and comment pointing to dashboard
- [x] T003 [P] Create `supabase/schema.sql` with database schema and RLS policies from plan
- [x] T004 [P] Create `supabase/storage.sql` with storage bucket definitions and policies from plan

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Supabase clients, auth helpers, types, validators, UI primitives, and Server Actions that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Create `lib/supabase/client.ts` — browser client using `createBrowserClient` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [x] T006 [P] Create `lib/supabase/server.ts` — server client using `createServerClient` with cookie-based session handling
- [x] T007 [P] Create `lib/supabase/proxy.ts` — `updateSession()` helper that refreshes session via `getClaims()` on every request
- [x] T008 Create `proxy.ts` at project root — imports `updateSession` from `lib/supabase/proxy`, exports `proxy()` function with route matcher (depends on T007)
- [x] T009 Create `lib/auth.ts` — `getUser()` returns claims or null via `getClaims()`, `requireAuth()` redirects to `/sign-in` if unauthenticated (depends on T006)
- [x] T010 [P] Create `lib/database.types.ts` — TypeScript types for `Profile`, `SocialLink`, `Project`, `ProfileCategory`, `ThemeName`, `ProfileWithRelations`
- [x] T011 [P] Create `lib/validators.ts` — Zod schemas: `signUpSchema` (email + password min 8), `signInSchema` (email + password min 1), `profileSchema`, `projectSchema`, `socialLinkSchema`
- [x] T012 [P] Create `lib/constants.ts` — `CATEGORIES`, `THEMES`, `SOCIAL_PLATFORMS` arrays with value/label pairs
- [x] T013 [P] Create `components/ui/button.tsx` — variants (default, outline, ghost, destructive), sizes, disabled/loading states, `rounded-full` pill shape, teal functional accent (`bg-teal-600 hover:bg-teal-700`) for form submit buttons (red brand accent used separately for marketing CTAs per constitution design system split)
- [x] T014 [P] Create `components/ui/input.tsx` — styled text input with error state (`border-red-500`), teal functional focus ring (`focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`)
- [x] T015 [P] Create `components/ui/card.tsx` — container with `border`, `rounded-lg`, shadow, padding
- [x] T016 [P] Create `components/ui/form-field.tsx` — wrapper component: `<label>` + child input + error message `<p>` in red
- [x] T017 Update `app/globals.css` — add design system CSS custom properties (`:root` vars), `@theme inline` block, theme classes (`.theme-minimal`, etc.), `::selection`, scrollbar styles, striped-border, animations
- [x] T018 Update `next.config.ts` — add `images.remotePatterns` for `*.supabase.co` storage URLs
- [x] T019 Create `actions/auth.ts` — three Server Actions: `signUp` (validates with signUpSchema, calls `supabase.auth.signUp()`, returns `{ success }` or `{ error }`), `signIn` (validates with signInSchema, calls `signInWithPassword()`, generic error message, `redirect('/dashboard')` on success), `signOut` (calls `supabase.auth.signOut()`, `redirect('/')`) (depends on T006, T011)

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Account Registration (Priority: P1)

**Goal**: New users can sign up with email/password and see a confirmation message

**Independent Test**: Visit `/sign-up`, enter valid email + password (8+ chars), submit → see "Check your email" message. Enter invalid data → see inline validation errors. Visit `/sign-up` while authenticated → redirect to `/dashboard`.

### Implementation for User Story 1

- [x] T020 [US1] Create `app/(auth)/layout.tsx` — Server Component, centered card layout wrapper with `max-w-md mx-auto` centered on page, no `"use client"`
- [x] T021 [US1] Create `components/auth/sign-up-form.tsx` — `"use client"`, uses `useActionState(signUp, null)`, fields: email + password using `Input` and `FormField` components, shows error/success messages from state, submit `Button` with pending/loading state, link to sign-in page (depends on T013, T014, T016, T019)
- [x] T022 [US1] Create `app/(auth)/sign-up/page.tsx` — Server Component, checks `getUser()` and redirects to `/dashboard` if authenticated (FR-015), renders `SignUpForm` inside a `Card`, page title "Create Account" (depends on T009, T015, T020, T021)

**Checkpoint**: User Story 1 fully functional — sign-up form works with validation and success message

---

## Phase 4: User Story 2 - Sign In and Sign Out (Priority: P1)

**Goal**: Returning users can sign in with credentials and sign out

**Independent Test**: Visit `/sign-in`, enter valid credentials → redirect to `/dashboard`. Enter invalid credentials → see "Invalid email or password". Visit `/sign-in` while authenticated → redirect to `/dashboard`. Sign out → redirect to `/`.

### Implementation for User Story 2

- [x] T023 [US2] Create `components/auth/sign-in-form.tsx` — `"use client"`, uses `useActionState(signIn, null)`, fields: email + password, shows generic error message from state, submit `Button` with pending state, link to sign-up page, reads `?error=confirmation_failed` from URL search params to show confirmation error (depends on T013, T014, T016, T019)
- [x] T024 [US2] Create `app/(auth)/sign-in/page.tsx` — Server Component, checks `getUser()` and redirects to `/dashboard` if authenticated (FR-015), renders `SignInForm` inside a `Card`, page title "Sign In" (depends on T009, T015, T020, T023)

**Checkpoint**: User Stories 1 AND 2 both work independently — full sign-up and sign-in flows functional

---

## Phase 5: User Story 3 - Navigation Reflects Auth State (Priority: P2)

**Goal**: Navbar shows auth links for anonymous users and user menu with avatar for authenticated users

**Independent Test**: View navbar as anonymous → see Sign In / Sign Up links. Sign in → navbar shows email initial avatar with dropdown containing Dashboard link and Sign Out button. Click Sign Out → navbar reverts.

### Implementation for User Story 3

- [x] T025 [P] [US3] Create `components/auth/user-menu.tsx` — `"use client"`, receives user email as prop, shows first letter of email in a colored circle (`bg-red text-white rounded-full`), click toggles dropdown with Dashboard link and Sign Out button, Sign Out calls `signOut` action (depends on T019)
- [x] T026 [US3] Create `components/layout/navbar.tsx` — Server Component, calls `getUser()` to check auth state, renders: logo (Space Grotesk, red, links to `/`), "Explore" link (points to `/explore` — will 404 until Explore feature is built, acceptable for incremental delivery), conditionally Sign In/Sign Up links (anonymous) or `UserMenu` (authenticated). Styled per design system: `fixed top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-foreground/5` (depends on T009, T025)
- [x] T027 [US3] Update `app/layout.tsx` — import Space Grotesk + JetBrains Mono via `next/font/google`, apply font CSS variables to `<body>`, import and render `Navbar` at top, import `Toaster` from `sonner` and render it, set `lang="en"` on `<html>` (depends on T026)

**Checkpoint**: Navigation fully functional with auth state reflection across all pages

---

## Phase 6: User Story 4 - Dashboard Access and Profile Status (Priority: P2)

**Goal**: Authenticated users see their dashboard with profile status; unauthenticated users are redirected

**Independent Test**: Sign in as user without profile → see "Create Your Profile" CTA. Visit `/dashboard` while signed out → redirect to `/sign-in`.

### Implementation for User Story 4

- [x] T028 [US4] Create `app/dashboard/layout.tsx` — Server Component, calls `requireAuth()` at top (redirects unauthenticated users to `/sign-in`), renders children inside a dashboard container (`max-w-[1400px] mx-auto px-6 md:px-12 py-12`) (depends on T009)
- [x] T029 [US4] Create `app/dashboard/page.tsx` — Server Component, fetches profile via `supabase.from('profiles').select('id').eq('user_id', claims.sub).single()`, if profile exists: show placeholder text ("Profile editor coming soon"), if no profile: show "Create Your Profile" CTA button styled with design system (large heading, descriptive text, red primary button) (depends on T006, T009, T028)

**Checkpoint**: All user stories 1-4 functional — complete auth flow with dashboard

---

## Phase 7: User Story 5 - Email Confirmation Handling (Priority: P3)

**Goal**: Email confirmation links verify tokens and redirect appropriately

**Independent Test**: Click valid confirmation link → redirect to `/dashboard`. Click expired/invalid link → redirect to `/sign-in?error=confirmation_failed`.

### Implementation for User Story 5

- [x] T030 [US5] Create `app/(auth)/auth/confirm/route.ts` — GET route handler, extracts `token_hash` and `type` from `request.nextUrl.searchParams`, creates server Supabase client, calls `supabase.auth.verifyOtp({ type, token_hash })`, redirects to `/dashboard` on success, redirects to `/sign-in?error=confirmation_failed` on failure, handles missing params gracefully (depends on T006)

**Checkpoint**: All 5 user stories complete — full authentication system functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Build verification and compliance checks

- [x] T031 Run `npm run build` and verify zero errors
- [x] T032 Verify no prohibited patterns exist: search codebase for `middleware.ts`, `getSession()` on server, `ANON_KEY`, `react-hook-form`, `any` type usage — must find zero matches. Also verify `proxy.ts` correctly calls `getClaims()` in `updateSession()` to ensure session refresh handles expiry on every request (covers edge case: session expires while user is on dashboard).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T001 (packages installed) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 completion
- **US2 (Phase 4)**: Depends on Phase 2 completion + T020 (auth layout from US1)
- **US3 (Phase 5)**: Depends on Phase 2 completion
- **US4 (Phase 6)**: Depends on Phase 2 completion
- **US5 (Phase 7)**: Depends on Phase 2 completion
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — creates auth layout used by US2
- **US2 (P1)**: Can start after Phase 2 + T020 (auth layout) — reuses layout from US1
- **US3 (P2)**: Can start after Phase 2 — independent of US1/US2 (navbar is a separate component)
- **US4 (P2)**: Can start after Phase 2 — independent of US1/US2 (dashboard is separate)
- **US5 (P3)**: Can start after Phase 2 — independent route handler

### Within Each User Story

- Components before pages (pages import components)
- Layout before pages (pages render inside layouts)
- Server Actions must exist before client forms that call them (handled by Phase 2)

### Parallel Opportunities

- T002, T003, T004 can run in parallel (Setup)
- T005, T006, T007 can run in parallel (Supabase clients)
- T010, T011, T012 can run in parallel (types, validators, constants)
- T013, T014, T015, T016 can run in parallel (UI primitives)
- US3 (T025-T027) and US4 (T028-T029) can run in parallel after Phase 2
- US5 (T030) can run in parallel with US3 and US4

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Registration)
4. Complete Phase 4: User Story 2 (Sign In/Out)
5. **STOP and VALIDATE**: Test sign-up → confirm → sign-in → sign-out flow
6. This delivers a working auth system without navbar or dashboard polish

### Full Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (Registration) → Test sign-up flow
3. Add US2 (Sign In/Out) → Test sign-in/out flow
4. Add US3 (Navbar) + US4 (Dashboard) in parallel → Test full navigation
5. Add US5 (Email Confirmation) → Test confirmation edge cases
6. Polish → Build verification + compliance check
7. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- US2 has a soft dependency on US1 (reuses auth layout T020) but no functional dependency
- `actions/auth.ts` (T019) is in Foundational because both US1 and US2 need it
- Commit after each phase completion
- Stop at any checkpoint to validate story independently
