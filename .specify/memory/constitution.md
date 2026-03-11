<!--
  Sync Impact Report
  ==================
  Version change: 0.0.0 → 1.0.0 (initial ratification)
  Modified principles: N/A (first version)
  Added sections:
    - Core Principles (10 principles)
    - Design System Constraints
    - Prohibited Patterns
    - Tooling & Infrastructure
    - Governance
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md — ✅ compatible (Constitution Check section exists)
    - .specify/templates/spec-template.md — ✅ compatible (no conflicts)
    - .specify/templates/tasks-template.md — ✅ compatible (phase structure aligns)
    - .specify/templates/checklist-template.md — ✅ compatible
    - .specify/templates/agent-file-template.md — ✅ compatible
  Follow-up TODOs: None
-->

# Vibes Constitution

## Core Principles

### I. Server-First Rendering

All components MUST be React Server Components by default. The `"use client"`
directive MUST only be added when a component requires browser interactivity
(event handlers, hooks, browser APIs). Client components MUST be small,
leaf-level, and never wrap large subtrees.

**Rationale**: Minimizes client bundle size, leverages server-side data
fetching, and aligns with Next.js 16 App Router architecture.

### II. Server Actions for Mutations

All data mutations MUST use `"use server"` actions defined in the `actions/`
directory. API route handlers (`app/api/`) MUST NOT be created for CRUD
operations. Every Server Action MUST validate input with Zod before any
database operation. Every mutation MUST call `revalidatePath()` after success.

**Rationale**: Centralizes mutation logic, enforces validation at the server
boundary, and ensures cache coherence.

### III. Proxy-Based Session Management

Session refresh MUST be handled by `proxy.ts` at the project root using the
`updateSession()` helper. The file `middleware.ts` MUST NOT exist in the
project — it is deprecated in Next.js 16.

**Rationale**: Next.js 16 replaces middleware with proxy. Using middleware
will cause runtime errors or be silently ignored.

### IV. Auth via getClaims()

All server-side authentication checks MUST use `supabase.auth.getClaims()`.
The method `getSession()` MUST NOT be used on the server. The `getUser()`
helper in `lib/auth.ts` and `requireAuth()` guard MUST be the standard
entry points for auth checks.

**Rationale**: `getClaims()` is the secure, non-deprecated method for
server-side token verification in Supabase SSR.

### V. Direct Supabase Queries with RLS

All database access MUST use the Supabase client directly — no ORM, no
Prisma, no query builders. Row Level Security policies on Supabase MUST
handle authorization. The application layer MUST NOT duplicate RLS logic
except for user-facing error messages.

**Rationale**: Eliminates ORM overhead and abstraction leaks. RLS provides
database-level authorization that cannot be bypassed by application bugs.

### VI. useActionState for Forms

All form state management and submission MUST use `useActionState` from
React 19. The libraries `react-hook-form` and `@hookform/resolvers` MUST
NOT be installed or used.

**Rationale**: React 19's built-in form primitives handle pending states,
error propagation, and progressive enhancement without third-party deps.

### VII. No UI Component Libraries

All UI primitives MUST be hand-built in `components/ui/` using Tailwind CSS
utility classes. The libraries shadcn/ui, Radix, MUI, Chakra, and any other
UI component library MUST NOT be installed.

**Rationale**: The project's design system (bold editorial aesthetic) is
incompatible with generic component library defaults. Hand-built components
ensure full visual control.

### VIII. Strict Package Policy

The only permitted dependencies are: `@supabase/supabase-js`, `@supabase/ssr`,
`zod`, and `sonner`. No additional packages MUST be installed without explicit
user approval. This includes utility libraries, icon packs, animation
libraries, and CSS-in-JS solutions.

**Rationale**: Prevents dependency bloat and ensures every addition is a
conscious decision.

### IX. TypeScript Strict Mode

All code MUST use TypeScript strict mode. The `any` type MUST NOT appear
anywhere in the codebase. All database types MUST be defined in
`lib/database.types.ts` and kept in sync with the Supabase schema.

**Rationale**: Strict typing catches bugs at compile time and serves as
living documentation for the data model.

### X. Design System Adherence

All UI MUST follow the Vibes design system defined in
`.claude/design-system.md`. Key non-negotiables:
- Brand color: Red `#E70000` as the single dominant accent
- Headings: Space Grotesk, uppercase, wide letter-spacing
- Body/UI text: JetBrains Mono (monospace editorial texture)
- Buttons: `rounded-full` pill shape, never squared
- Spacing: `py-24 md:py-36` sections, `max-w-[1400px]` container
- Color tokens defined via CSS custom properties and `@theme inline`
- Striped dividers between sections, marquee bands for social proof
- All headings uppercase — body text is the only sentence-case element

**Rationale**: Visual consistency is the product's core value proposition.
Deviations create a fragmented user experience.

## Design System Constraints

Color tokens MUST be used via CSS custom properties:

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#FAFAF8` | Page background |
| `--foreground` | `#0A0A0A` | Primary text, dark sections |
| `--red` | `#E70000` | CTAs, accent text, marquees, scrollbar |
| `--red-dark` | `#C10000` | Hover/active state for red elements |
| `--lime` | `#8DE746` | Highlights on dark/red backgrounds only |
| `--gray` | `#6B6B6B` | Body text, descriptions |
| `--light-gray` | `#E8E8E8` | Borders, decorative elements |

Font assignments:
- `Space Grotesk` → headings, logo, prices, decorative numbers, marquee text
- `JetBrains Mono` → body, navigation, labels, tags, buttons, footers

## Prohibited Patterns

The following MUST NOT exist in the codebase:

| Pattern | Reason |
|---------|--------|
| `middleware.ts` | Deprecated in Next.js 16; use `proxy.ts` |
| `getSession()` on server | Insecure; use `getClaims()` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Wrong env var name; use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| `localStorage` / `sessionStorage` | Server-first architecture; no client storage |
| `app/api/` route handlers for CRUD | Use Server Actions in `actions/` |
| Prisma or any ORM import | Direct Supabase client only |
| `react-hook-form` import | Use `useActionState` |
| UI library imports (shadcn, radix, MUI) | Hand-built components only |
| `type: any` | TypeScript strict mode enforced |
| `Resend` or email service imports | Supabase Auth handles emails |
| `SUPABASE_SECRET_KEY` in client code | Never expose with `NEXT_PUBLIC_` prefix |

## Tooling & Infrastructure

- **Supabase MCP server**: Configured and authenticated in this project.
  Use MCP tools for Supabase operations when available.
- **Supabase CLI**: Installed and ready for use. Can be used for type
  generation, migrations, and local development.
- **Environment variables**: `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`
- **Database schema**: Defined in `supabase/schema.sql` (3 tables with RLS)
  and `supabase/storage.sql` (2 buckets with policies)
- **Build verification**: `npm run build` MUST pass with zero errors after
  every phase completion

## Governance

This constitution is the authoritative source for architectural and design
decisions in the Vibes project. All implementation work MUST comply with
these principles.

**Amendment procedure**:
1. Propose the change with rationale
2. Verify no existing code violates the new rule (or plan migration)
3. Update this document with the change
4. Increment version per semantic versioning:
   - MAJOR: Principle removal or incompatible redefinition
   - MINOR: New principle added or existing one materially expanded
   - PATCH: Clarifications, wording, typo fixes
5. Update `LAST_AMENDED_DATE`
6. Propagate changes to dependent templates if affected

**Compliance review**: Every spec, plan, and task list MUST include a
Constitution Check that verifies alignment with these principles before
implementation begins.

**Version**: 1.0.0 | **Ratified**: 2026-03-12 | **Last Amended**: 2026-03-12
