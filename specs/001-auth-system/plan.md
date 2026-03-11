# Implementation Plan: Authentication System

**Branch**: `001-auth-system` | **Date**: 2026-03-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-auth-system/spec.md`

## Summary

Build the complete authentication flow for the Vibes portfolio platform: sign-up with email confirmation, sign-in with generic error handling, sign-out, navbar auth state reflection with email-initial avatar fallback, dashboard route protection, and authenticated-user redirect from auth pages. Requires Phase 1 Foundation (Supabase clients, validators, UI primitives) to be built first as a prerequisite.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), React 19.2, Next.js 16.1.6
**Primary Dependencies**: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `sonner`
**Storage**: Supabase (PostgreSQL) via Supabase client — `profiles` table queried for dashboard status check
**Testing**: Manual verification per spec acceptance scenarios; `npm run build` as gate
**Target Platform**: Web (all modern browsers), server-rendered via Next.js App Router
**Project Type**: Web application (Next.js full-stack)
**Performance Goals**: Sign-in to dashboard < 10s; form validation feedback < 1s
**Constraints**: No middleware.ts; no getSession(); no UI libraries; no additional packages
**Scale/Scope**: Single user role, 5 routes, 8 components, 3 Server Actions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Server-First Rendering | PASS | Navbar, layouts, pages are Server Components. Only forms and user-menu are `"use client"`. |
| II. Server Actions for Mutations | PASS | `signUp`, `signIn`, `signOut` defined in `actions/auth.ts`. No API routes. Zod validation in each action. |
| III. Proxy-Based Session Management | PASS | `proxy.ts` at project root handles session refresh. No `middleware.ts`. |
| IV. Auth via getClaims() | PASS | `lib/auth.ts` uses `getClaims()` exclusively. No `getSession()` calls. |
| V. Direct Supabase Queries with RLS | PASS | Dashboard page queries `profiles` table directly via Supabase client. RLS handles access control. |
| VI. useActionState for Forms | PASS | `sign-in-form.tsx` and `sign-up-form.tsx` use `useActionState`. No react-hook-form. |
| VII. No UI Component Libraries | PASS | Hand-built `components/ui/*` (button, input, card, form-field). No shadcn/radix/MUI. |
| VIII. Strict Package Policy | PASS | Only `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `sonner` installed. |
| IX. TypeScript Strict Mode | PASS | No `any` types. All action return types explicitly defined. |
| X. Design System Adherence | PASS | Navbar uses design system (fixed, blurred bg, red accent CTA, monospace nav links, Space Grotesk logo). Auth forms use teal accent per UI primitives. |

**Gate result**: ALL PASS — proceed to implementation.

## Project Structure

### Documentation (this feature)

```text
specs/001-auth-system/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
app/
├── globals.css                        # Updated with design system tokens
├── layout.tsx                         # Updated: fonts, Navbar, Toaster
├── page.tsx                           # Existing (untouched by this feature)
├── (auth)/
│   ├── layout.tsx                     # Centered card layout wrapper
│   ├── sign-in/page.tsx               # Renders SignInForm
│   ├── sign-up/page.tsx               # Renders SignUpForm
│   └── auth/confirm/route.ts         # Email confirmation GET handler
└── dashboard/
    ├── layout.tsx                     # requireAuth() guard + container
    └── page.tsx                       # Profile status check + CTA

actions/
└── auth.ts                            # signUp, signIn, signOut Server Actions

components/
├── ui/
│   ├── button.tsx                     # Variants: default, outline, ghost, destructive
│   ├── input.tsx                      # Styled text input with error state
│   ├── card.tsx                       # Container with border/shadow/padding
│   └── form-field.tsx                 # Label + input + error message wrapper
├── layout/
│   └── navbar.tsx                     # Server Component: auth-aware navigation
└── auth/
    ├── sign-in-form.tsx               # "use client" — useActionState
    ├── sign-up-form.tsx               # "use client" — useActionState
    └── user-menu.tsx                  # "use client" — avatar dropdown

lib/
├── supabase/
│   ├── client.ts                      # createBrowserClient
│   ├── server.ts                      # createServerClient (cookies)
│   └── proxy.ts                       # updateSession helper
├── auth.ts                            # getUser(), requireAuth()
├── validators.ts                      # signUpSchema, signInSchema
├── constants.ts                       # CATEGORIES, THEMES, SOCIAL_PLATFORMS
└── database.types.ts                  # TypeScript types for DB tables

proxy.ts                               # Root-level Next.js 16 proxy
```

**Structure Decision**: Next.js App Router convention — `app/` for routes, `lib/` for utilities, `components/` for UI, `actions/` for Server Actions. This feature creates the foundational directory structure that all subsequent features build upon.

## Complexity Tracking

> No Constitution Check violations — this section is intentionally empty.
