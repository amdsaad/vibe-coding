# Research: Profile CRUD

**Feature**: 002-profile-crud | **Date**: 2026-03-12

## R-001: Schema Alignment — Field Naming

**Decision**: Align to plan.md naming: `username` (display name), `slug` (URL path), `published` (visibility flag).

**Rationale**: The plan.md is the authoritative spec for this project. The existing schema was built from an earlier iteration that used `username` as the URL slug and `display_name` as the display name. The plan.md separates these concerns more clearly: `username` is what the user sees (display), `slug` is the URL-safe unique identifier.

**Alternatives considered**:
- Keep existing naming and update the plan.md: Rejected — the plan.md is the single source of truth and changing it would cascade to all future features.
- Add `slug` as a new column alongside existing `username`: This is the migration approach — rename `username` → `slug`, rename `display_name` → `username`, preserving data.

## R-002: Schema Alignment — Categories and Themes

**Decision**: Adopt plan.md categories (developer, designer, photographer, writer, marketer, data_scientist, product_manager, other) and themes (minimal, bold, elegant, neon, paper, terminal).

**Rationale**: The plan.md defines the product vision. The existing categories (creative, musician, filmmaker) and themes (playful, dark) were from an earlier iteration. The new set better targets the professional portfolio use case.

**Alternatives considered**:
- Merge both sets (superset): Rejected — too many options dilute UX, and the DB CHECK constraints would need updating regardless.
- Keep existing: Rejected — conflicts with plan.md spec and future features (theme CSS variables defined for the plan.md set only).

## R-003: Skills Column Addition

**Decision**: Add `skills text[] default '{}'` column to profiles table.

**Rationale**: Skills are a core feature (User Story 3, FR-008). PostgreSQL native array type is the simplest solution — no join table needed, supports array operations, and aligns with the plan.md schema. Max 20 skills enforced at application layer via Zod validation.

**Alternatives considered**:
- Separate `skills` table with many-to-many: Rejected — over-engineered for simple text tags. No need for skill normalization or cross-profile skill search at this stage.
- JSON column: Rejected — text[] is more idiomatic for PostgreSQL and has better query support.

## R-004: Social Links Save Pattern

**Decision**: Atomic replace pattern — delete all existing links for the profile, then insert all new links in a single operation.

**Rationale**: Simplest approach for a small number of links (max ~7-10). Avoids complex diffing logic. The predefined platform list is small (7 platforms), so the total link count is naturally bounded.

**Alternatives considered**:
- Upsert with individual add/remove: More complex, requires tracking which links were added/removed/modified. Unnecessary complexity for this scale.
- Batch upsert with conflict handling: PostgreSQL `ON CONFLICT` could work but adds complexity without clear benefit.

## R-005: Image Upload Architecture

**Decision**: Client-side uploads directly to Supabase Storage via `createBrowserClient`. Upload returns a public URL that is then saved to the profile/project record via a Server Action.

**Rationale**: Supabase Storage is already configured with buckets and RLS policies. Client-side upload avoids routing large files through the Next.js server. The `lib/storage.ts` helper abstracts the upload logic.

**Alternatives considered**:
- Server-side upload via Server Action with FormData: Would route file data through the server, adding latency and memory pressure. Not necessary since Supabase Storage accepts direct client uploads with auth tokens.
- Signed URL upload: Overkill for public buckets with auth-only write policies.

## R-006: Profile Form Architecture

**Decision**: Single main profile form using `useActionState` for basic info + skills + theme + category + published toggle. Social links are part of the same form (saved atomically via hidden JSON input). Projects are managed separately with their own Server Actions.

**Rationale**: Profile fields, skills, social links, and theme are all conceptually "profile settings" and benefit from a single save action. Projects are independent entities with their own CRUD lifecycle (add/edit/delete individually), making separate actions cleaner.

**Alternatives considered**:
- Fully separate forms for each section (profile, skills, social links): More Server Actions, more save buttons, more confusing UX.
- Everything in one mega-form including projects: Projects have their own images and independent lifecycle — bundling them in the profile form would make the form overly complex.

## R-007: Slug Availability Check

**Decision**: Client-side debounced query (500ms) using `createBrowserClient` to check slug uniqueness. Server-side validation on form submit as the authoritative check.

**Rationale**: The client-side check is a UX convenience — it prevents the user from submitting a form only to get a server error. The server-side check (in the Server Action) is the real uniqueness enforcement. Using the browser client for the check leverages RLS select policies.

**Alternatives considered**:
- Server Action for slug check: Would work but adds unnecessary server round-trips for a simple SELECT query that the browser client can do directly.
- No client-side check (server-only): Poor UX — user would only discover slug conflicts on form submission.

## R-008: Delete Confirmation UX

**Decision**: Inline confirmation button pattern — user clicks "Delete Profile", button changes to "Confirm Delete" (destructive styling), second click performs the deletion.

**Rationale**: Simpler than a modal dialog, no additional component needed. The two-click pattern is a well-understood confirmation pattern. No need for type-to-confirm since profile deletion is reversible by re-creating.

**Alternatives considered**:
- Modal dialog: Requires a modal component (not yet built), adds complexity.
- Type-to-confirm: Overkill for a portfolio profile that can be re-created.

## R-009: Migration Strategy

**Decision**: Create a migration SQL file (`supabase/migrations/002-align-schema.sql`) with ALTER TABLE statements plus update the canonical `supabase/schema.sql` to reflect the target state. Users who have already run the old schema will need to run the migration.

**Rationale**: Some users may have already deployed the old schema from feature 001. A migration file provides a clear upgrade path. The canonical schema.sql always reflects the current target state for fresh deployments.

**Alternatives considered**:
- Drop and recreate tables: Destructive — loses any existing data.
- Only update schema.sql: Users with existing databases would have no migration path.
