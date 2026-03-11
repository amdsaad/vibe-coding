# Data Model: Authentication System

**Feature**: 001-auth-system
**Date**: 2026-03-12

## Entities

### User Account (managed by Supabase Auth)

This entity is fully managed by `auth.users` in Supabase. The application does not directly read or write this table — all interactions go through `supabase.auth.*` methods.

| Attribute | Type | Constraints | Notes |
|-----------|------|-------------|-------|
| id | UUID | Primary key, auto-generated | Referenced as `user_id` in `profiles` table |
| email | string | Unique, required, valid email format | Used for sign-in and avatar fallback initial |
| encrypted_password | string | Min 8 characters (enforced at sign-up) | Managed by Supabase Auth |
| email_confirmed_at | timestamp | Nullable | Set when user clicks confirmation link |
| created_at | timestamp | Auto-generated | Account creation time |

### User Session (managed by Supabase Auth)

Sessions are cookie-based, managed by `@supabase/ssr`. The application interacts with sessions through:
- `proxy.ts` → `updateSession()` → refreshes session on every request
- `getClaims()` → reads session claims server-side
- `signOut()` → destroys session

No application-level session storage exists.

### Profile (referenced, not managed by this feature)

The `profiles` table is defined in `supabase/schema.sql` and will be managed by the Profile CRUD feature. This feature only queries it to determine dashboard state:

```
SELECT id FROM profiles WHERE user_id = <authenticated_user_id> LIMIT 1
```

- **If row exists**: Dashboard shows profile editor placeholder
- **If no row**: Dashboard shows "Create Your Profile" CTA

## Server Action Signatures

### `signUp(prevState: ActionState, formData: FormData): Promise<ActionState>`

**Input** (from FormData):
- `email`: string — validated by `signUpSchema`
- `password`: string — validated by `signUpSchema` (min 8 chars)

**Output**:
- Success: `{ success: "Check your email for a confirmation link" }`
- Validation error: `{ error: "Invalid email address" }` or `{ error: "Password must be at least 8 characters" }`
- Auth error: `{ error: <Supabase error message> }`

### `signIn(prevState: ActionState, formData: FormData): Promise<ActionState>`

**Input** (from FormData):
- `email`: string — validated by `signInSchema`
- `password`: string — validated by `signInSchema` (min 1 char)

**Output**:
- Success: calls `redirect('/dashboard')` — never returns
- Validation error: `{ error: "Invalid email address" }` or `{ error: "Password is required" }`
- Auth error: `{ error: "Invalid email or password" }` (generic, regardless of specific failure)

### `signOut(): Promise<void>`

**Input**: None
**Output**: calls `redirect('/')` — never returns

## State Type

```typescript
type ActionState = {
  error?: string
  success?: string
} | null
```

## Email Confirmation Route

### `GET /auth/confirm`

**Input** (URL search params):
- `token_hash`: string
- `type`: string (e.g., `"signup"`, `"email"`)

**Output**:
- Valid token: `redirect('/dashboard')`
- Invalid/expired token: `redirect('/sign-in?error=confirmation_failed')`

## Entity Relationships

```
auth.users (Supabase-managed)
    │
    │ 1:1 (user_id FK)
    ▼
profiles (queried read-only by this feature)
    │
    │ 1:N (profile_id FK)
    ├──► social_links (not used by this feature)
    └──► projects (not used by this feature)
```

## Auth State Flow

```
Unauthenticated          Authenticated
     │                        │
     ├─ /sign-up ────────►    │ (after email confirm)
     │                        │
     ├─ /sign-in ────────►    │ (on valid credentials)
     │                        │
     │  ◄──────── /sign-out ──┤
     │                        │
     │  ◄──── session expire ─┤
     │                        │
     ├─ /dashboard ──► redirect to /sign-in
     │                        │
     │                        ├─ /sign-in ──► redirect to /dashboard
     │                        ├─ /sign-up ──► redirect to /dashboard
     │                        └─ /dashboard ──► show content
```
