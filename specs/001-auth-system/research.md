# Research: Authentication System

**Feature**: 001-auth-system
**Date**: 2026-03-12

## R1: Supabase Auth with Next.js 16 App Router

**Decision**: Use `@supabase/ssr` with cookie-based session management via `proxy.ts` (not `middleware.ts`).

**Rationale**: Next.js 16 deprecates `middleware.ts` in favor of `proxy.ts`. The `@supabase/ssr` package provides `createServerClient` and `createBrowserClient` that integrate with Next.js cookie handling. Session refresh happens in `proxy.ts` via `updateSession()` which calls `getClaims()` to verify and refresh tokens on every request.

**Alternatives considered**:
- `middleware.ts` — deprecated in Next.js 16, would cause silent failures
- `getSession()` on server — insecure per Supabase SSR docs; `getClaims()` is the correct server-side method
- JWT-only (no cookies) — incompatible with SSR; cookies are required for Server Components to access auth state

## R2: Form State Management with useActionState

**Decision**: Use React 19's `useActionState` hook for all auth forms.

**Rationale**: `useActionState` provides built-in pending state tracking, error propagation from Server Actions, and progressive enhancement. It replaces the need for `react-hook-form` + `@hookform/resolvers` while staying within the React 19 primitives.

**Alternatives considered**:
- `react-hook-form` — prohibited by constitution (Principle VI)
- Manual `useState` + `fetch` — loses progressive enhancement and Server Action integration
- `useFormState` (deprecated) — renamed to `useActionState` in React 19

## R3: Server Action Return Type Pattern

**Decision**: Server Actions return `{ error?: string; success?: string }` for form feedback. Use `redirect()` for navigation after successful mutations.

**Rationale**: `useActionState` receives the return value as the new state. Returning an object with optional `error`/`success` fields allows the client form to render inline feedback. For sign-in, `redirect('/dashboard')` is called server-side on success (never returns). For sign-up, the action returns `{ success: 'Check your email' }` since the user must confirm before signing in.

**Alternatives considered**:
- Throwing errors — not compatible with `useActionState`; errors would hit error boundary instead of inline display
- Returning status codes — less ergonomic for form rendering

## R4: Email Confirmation Callback Route

**Decision**: Use a GET route handler at `app/(auth)/auth/confirm/route.ts` to handle email confirmation links.

**Rationale**: Supabase Auth sends confirmation emails with links containing `token_hash` and `type` query parameters. A GET route handler extracts these params and calls `supabase.auth.verifyOtp({ type, token_hash })`. This is the one place where a route handler (not a Server Action) is appropriate — it's not a CRUD operation, it's a redirect-based callback from an external email link.

**Alternatives considered**:
- Server Action — cannot be triggered by a GET link click from an email
- Client-side verification — would flash unauthenticated UI before redirect

## R5: Auth Page Redirect for Authenticated Users

**Decision**: Auth pages (`/sign-in`, `/sign-up`) check auth state server-side and redirect to `/dashboard` if already authenticated.

**Rationale**: Prevents confusion when a signed-in user bookmarks or revisits auth pages. The check happens in the page Server Components using `getUser()` — if non-null, `redirect('/dashboard')` is called. This is a read-only check, not a mutation, so it belongs in the page component, not a Server Action.

**Alternatives considered**:
- Client-side redirect — would flash the auth form before redirecting
- Proxy-level redirect — too broad; would need path matching logic that belongs in the application layer

## R6: Avatar Fallback Strategy

**Decision**: Display the first letter of the user's email in a colored circle when no profile avatar exists.

**Rationale**: New users won't have a profile (and thus no avatar) immediately after sign-up. Using the email initial provides a personalized fallback without requiring additional data. The colored circle uses the brand's design system colors. Once a profile with an avatar is created (future feature), the avatar image replaces the initial.

**Alternatives considered**:
- Generic silhouette icon — impersonal, doesn't differentiate users
- Gravatar — requires additional external service call; against strict package policy
- Empty/hidden avatar — poor UX; user menu needs a visual anchor

## R7: Generic Sign-In Error Messages

**Decision**: All sign-in failures display "Invalid email or password" regardless of the specific failure reason.

**Rationale**: Distinguishing between "email not found" and "wrong password" enables account enumeration attacks — an attacker can determine which emails are registered. The generic message prevents this information leak while still informing the user that their credentials are incorrect. Supabase Auth returns specific error codes, but the Server Action maps all authentication failures to the generic message.

**Alternatives considered**:
- Specific error messages — better UX but creates security vulnerability
- CAPTCHA after N failures — out of scope; Supabase handles rate limiting
