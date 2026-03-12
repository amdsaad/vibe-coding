# Feature Specification: Profile CRUD

**Feature Branch**: `002-profile-crud`
**Created**: 2026-03-12
**Status**: Draft
**Input**: User description: "Create, edit, and delete portfolio profiles with skills, social links, projects, and image uploads from the dashboard"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Profile with Basic Info (Priority: P1)

An authenticated user who has just signed up visits the dashboard and sees a prompt to create their portfolio profile. They fill in their username, choose a URL slug, write a short bio, select a professional category, and save. Their profile is now created and stored.

**Why this priority**: Without profile creation, no other feature (editing, projects, social links, public profiles) can function. This is the foundational action that unlocks all subsequent value.

**Independent Test**: Sign in as a new user with no profile, visit the dashboard, fill in the profile creation form (username, slug, bio, category), submit, and verify the profile is persisted. Reload the page and confirm the data appears in edit mode.

**Acceptance Scenarios**:

1. **Given** an authenticated user with no profile, **When** they visit the dashboard, **Then** they see a profile creation form with fields for username, slug, bio, and category.
2. **Given** the user fills in valid profile data and submits, **When** the system processes the form, **Then** the profile is saved and the dashboard shows the profile in edit mode.
3. **Given** the user enters a slug that is already taken, **When** they submit the form, **Then** they see a validation error indicating the slug is unavailable.
4. **Given** the user submits the form with missing required fields (username, slug), **When** the system validates, **Then** inline error messages appear for each invalid field.
5. **Given** the user enters a slug with invalid characters (spaces, uppercase, special chars), **When** the system validates, **Then** an error explains slugs can only contain lowercase letters, numbers, and hyphens.

---

### User Story 2 - Edit Profile and Choose Theme (Priority: P1)

A user who already has a profile visits the dashboard and sees their existing profile data pre-filled in the form. They can update any field — username, slug, bio, category, theme, skills, and published status — and save changes. They can also select a visual theme for their public profile from a set of preview cards.

**Why this priority**: Editing is equally critical to creation — users must be able to iterate on their profile. Theme selection is bundled here because it's a core profile attribute stored in the same record.

**Independent Test**: Sign in as a user with an existing profile, visit the dashboard, modify the username and select a different theme, save, reload, and verify changes persisted.

**Acceptance Scenarios**:

1. **Given** an authenticated user with an existing profile, **When** they visit the dashboard, **Then** the profile form is pre-filled with their current data.
2. **Given** the user changes their username and saves, **When** the page reloads, **Then** the updated username is displayed.
3. **Given** the user selects a different theme from the theme picker, **When** they save, **Then** the new theme is stored and reflected on their public profile.
4. **Given** the user toggles the "published" switch off, **When** they save, **Then** their profile is no longer visible on public pages.
5. **Given** the user changes their slug to one that's available, **When** they save, **Then** the profile's public URL updates to the new slug.

---

### User Story 3 - Manage Skills (Priority: P2)

A user can add professional skills to their profile using a tag-style input. They type a skill name and press Enter or click "Add" to create a skill badge. Skills appear as removable badges below the input. The user can remove any skill by clicking its remove button. A maximum of 20 skills can be added.

**Why this priority**: Skills are a key differentiator on portfolio profiles but are not blocking for a minimal viable profile. The profile is useful without them.

**Independent Test**: Open the profile editor, type a skill name, press Enter, verify the badge appears. Add multiple skills, remove one, save, reload, and confirm the correct skills persisted.

**Acceptance Scenarios**:

1. **Given** the user types a skill name and presses Enter, **When** the input processes, **Then** a removable badge appears below the input and the text input clears.
2. **Given** a skill badge is displayed, **When** the user clicks its remove button, **Then** the badge is removed from the list.
3. **Given** the user has 20 skills, **When** they try to add another, **Then** the system prevents it and shows a message indicating the maximum has been reached.
4. **Given** the user adds/removes skills and saves the profile, **When** they reload the page, **Then** the saved skills are correctly displayed.
5. **Given** the user tries to add a skill that already exists in their list, **When** processing, **Then** the duplicate is not added.

---

### User Story 4 - Manage Social Links (Priority: P2)

A user can add links to their social media profiles and websites. Each link consists of a platform selection (GitHub, LinkedIn, Twitter/X, Website, YouTube, Dribbble, Behance) and a URL. Links are displayed as dynamic rows that can be added, edited, and removed. All links are saved atomically when the profile is saved.

**Why this priority**: Social links add significant value to a portfolio profile but are not essential for the profile to exist and be useful.

**Independent Test**: Open the profile editor, click "Add Link", select a platform, enter a URL, add a second link, remove the first, save, reload, and verify the correct links persisted.

**Acceptance Scenarios**:

1. **Given** the user clicks "Add Link", **When** a new row appears, **Then** it contains a platform dropdown and URL input.
2. **Given** the user fills in a platform and valid URL, **When** they save the profile, **Then** the social link is persisted.
3. **Given** the user enters an invalid URL, **When** they save, **Then** a validation error appears for that link's URL field.
4. **Given** the user clicks remove on a social link row, **When** processing, **Then** the row is removed from the form.
5. **Given** the user has multiple social links and saves, **When** they reload, **Then** all links appear in the correct order with correct data.

---

### User Story 5 - Manage Projects (Priority: P2)

A user can add portfolio projects to their profile. Each project has a title, description, external URL, and sort order. Projects are managed independently from the main profile form — each project has its own add/edit/save/delete actions. Projects appear as cards in the dashboard editor.

**Why this priority**: Projects showcase the user's work and are central to a portfolio, but the profile is still valuable without them.

**Independent Test**: Open the dashboard, click "Add Project", fill in title and description, save, verify it appears as a card. Edit the project's title, save, verify the change. Delete the project, verify it's removed.

**Acceptance Scenarios**:

1. **Given** the user clicks "Add Project", **When** the project form appears, **Then** it contains fields for title, description, URL, and sort order.
2. **Given** the user fills in a valid title and saves, **When** the project is created, **Then** it appears as a card in the project list.
3. **Given** an existing project card, **When** the user clicks edit and changes the title, **Then** the updated title is saved and displayed.
4. **Given** an existing project card, **When** the user clicks delete, **Then** the project is removed from the list and the database.
5. **Given** the user submits a project without a title, **When** the system validates, **Then** an error message indicates the title is required.

---

### User Story 6 - Upload Avatar (Priority: P3)

A user can upload a profile picture (avatar) from the dashboard. Accepted formats are JPEG, PNG, and WebP with a maximum file size of 2MB. After selecting a file, the avatar uploads immediately and a preview is shown. The avatar URL is stored with the profile.

**Why this priority**: Avatars enhance the visual appeal of profiles but are not required for core profile functionality.

**Independent Test**: Open the profile editor, click the avatar upload area, select a valid image file, verify the preview appears immediately. Save the profile, reload, and confirm the avatar persists.

**Acceptance Scenarios**:

1. **Given** the user clicks the avatar upload area, **When** they select a valid image (JPEG/PNG/WebP, under 2MB), **Then** the image uploads and a preview is displayed immediately.
2. **Given** the user selects a file larger than 2MB, **When** the upload is attempted, **Then** the system rejects it with a file-size error message.
3. **Given** the user selects a non-image file, **When** the upload is attempted, **Then** the system rejects it with a file-type error message.
4. **Given** the user has uploaded an avatar and saves the profile, **When** they reload the dashboard, **Then** the avatar is still displayed.
5. **Given** the user uploads a new avatar to replace an existing one, **When** the upload completes, **Then** the preview updates to show the new image.

---

### User Story 7 - Upload Project Images (Priority: P3)

A user can attach an image to each project. Accepted formats are JPEG, PNG, WebP, and GIF with a maximum file size of 5MB. The image uploads from the project card editor and shows a preview. The image URL is stored with the project.

**Why this priority**: Project images make the portfolio visually richer but projects are functional without them.

**Independent Test**: Open a project card editor, upload an image, verify the preview. Save the project, reload, and confirm the image persists.

**Acceptance Scenarios**:

1. **Given** the user clicks the image upload in a project editor, **When** they select a valid image (JPEG/PNG/WebP/GIF, under 5MB), **Then** the image uploads and a preview is displayed.
2. **Given** the user selects a file larger than 5MB, **When** the upload is attempted, **Then** the system rejects it with a file-size error message.
3. **Given** the user saves the project with an image, **When** they reload, **Then** the image is still associated with the project.

---

### User Story 8 - Real-Time Slug Availability Check (Priority: P2)

When creating or editing a profile, the slug input checks availability in real time. After the user stops typing for 500ms, the system queries whether the slug is taken. A green checkmark indicates availability; a red X indicates the slug is taken. A preview of the full public URL is shown below the input.

**Why this priority**: Slug uniqueness is a hard constraint. Real-time feedback prevents frustrating form submission failures and is essential for good UX, but technically the slug is validated on submit regardless.

**Independent Test**: Open the profile form, type a slug, wait 500ms, and verify the availability indicator appears. Try a slug known to be taken and verify the red indicator. Try an available slug and verify the green indicator.

**Acceptance Scenarios**:

1. **Given** the user types a slug and pauses for 500ms, **When** the check completes, **Then** a green check appears if the slug is available.
2. **Given** the user types a slug that is already taken by another user, **When** the check completes, **Then** a red X appears indicating unavailability.
3. **Given** the user is editing their own profile and the slug hasn't changed, **When** the check runs, **Then** their own slug shows as available (not flagged as taken).
4. **Given** the user types a slug, **When** the preview URL is rendered below the input, **Then** it shows the full path format (e.g., `/u/the-slug`).

---

### User Story 9 - Delete Profile (Priority: P3)

A user can permanently delete their entire profile from the dashboard. This removes the profile and all associated data (social links, projects). A confirmation step prevents accidental deletion.

**Why this priority**: Account data deletion is important for user control and trust but is a destructive action used rarely.

**Independent Test**: Open the dashboard with an existing profile, trigger the delete action, confirm, verify the profile no longer exists and the dashboard shows the "create profile" state.

**Acceptance Scenarios**:

1. **Given** the user initiates profile deletion, **When** a confirmation prompt appears, **Then** the user must confirm before the deletion proceeds.
2. **Given** the user confirms deletion, **When** the system processes it, **Then** the profile, all social links, and all projects are removed.
3. **Given** the profile is deleted, **When** the user views the dashboard, **Then** they see the "Create Your Profile" prompt again.
4. **Given** the user cancels the deletion confirmation, **When** returning to the dashboard, **Then** the profile remains intact.

---

### Edge Cases

- What happens when a user tries to create a second profile? The system must prevent it — one profile per user account.
- What happens when the user submits the profile form while a slug availability check is still in progress? The server-side validation catches duplicate slugs regardless of the client-side check.
- What happens if an image upload fails mid-way (network error)? The user sees an error message and can retry. The profile/project data is not affected.
- What happens when a user's session expires while editing a long form? The next server action call detects the unauthenticated state and redirects to sign-in. Unsaved form data is lost (standard web behavior).
- What happens if the user removes all social links and saves? The system deletes all existing links for that profile — an empty set is valid.
- What happens if a user enters a bio exceeding 500 characters? Server-side validation rejects it with a clear error message.
- What happens if a user enters more than 20 skills via manipulation? Server-side validation enforces the maximum regardless of client-side state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to create exactly one profile per account.
- **FR-002**: System MUST require username (2-50 chars) and slug (2-50 chars, lowercase alphanumeric and hyphens only) as mandatory profile fields.
- **FR-003**: System MUST enforce slug uniqueness across all profiles.
- **FR-004**: System MUST allow users to set their profile category from a fixed set: developer, designer, photographer, writer, marketer, data_scientist, product_manager, other.
- **FR-005**: System MUST allow users to select a visual theme from a fixed set: minimal, bold, elegant, neon, paper, terminal.
- **FR-006**: System MUST allow users to add an optional bio (max 500 characters).
- **FR-007**: System MUST allow users to toggle profile visibility (published/unpublished).
- **FR-008**: System MUST allow users to add up to 20 skills as text tags (max 30 characters each).
- **FR-009**: System MUST allow users to add, edit, and remove social links with platform selection and URL.
- **FR-010**: System MUST validate all social link URLs as valid URLs.
- **FR-011**: System MUST save all social links atomically (replace pattern — delete existing, insert all new).
- **FR-012**: System MUST allow users to add, edit, and remove portfolio projects independently from the main profile form.
- **FR-013**: System MUST require a title (1-100 chars) for each project and allow optional description (max 500 chars), URL, and sort order (integer, default 0).
- **FR-014**: System MUST allow users to upload an avatar image (JPEG/PNG/WebP, max 2MB).
- **FR-015**: System MUST allow users to upload a project image (JPEG/PNG/WebP/GIF, max 5MB).
- **FR-016**: System MUST show an immediate preview of uploaded images before saving.
- **FR-017**: System MUST validate all form inputs on the server side before any database operation.
- **FR-018**: System MUST provide real-time slug availability feedback with a 500ms debounce delay.
- **FR-019**: System MUST show the public profile URL preview below the slug input.
- **FR-020**: System MUST allow users to permanently delete their profile with a confirmation step.
- **FR-021**: Profile deletion MUST cascade to remove all associated social links and projects.
- **FR-022**: System MUST update timestamps automatically when profiles or projects are modified.
- **FR-023**: System MUST show toast notifications for success/error after every save, delete, or upload operation.
- **FR-024**: System MUST pre-fill the edit form with existing profile data when the user has a profile.
- **FR-025**: System MUST prevent unauthenticated access to all profile management features by redirecting to sign-in.
- **FR-026**: System MUST reject file uploads that exceed size limits or have disallowed MIME types with clear error messages.

### Key Entities

- **Profile**: Represents a user's portfolio identity. Has username, slug (unique URL identifier), bio, avatar image URL, professional category, visual theme, skills (list of text tags), and published status. Belongs to exactly one user account. Has many social links and projects.
- **Social Link**: A link to an external platform (GitHub, LinkedIn, etc.). Has platform identifier, URL, and sort order. Belongs to one profile.
- **Project**: A portfolio work item. Has title, description, external URL, image URL, and sort order. Belongs to one profile.

## Assumptions

- Each user account can have at most one profile. Attempting to create a second profile is prevented.
- The profile category and theme options are fixed and do not change without a code update.
- Social link platforms are limited to the predefined set (GitHub, LinkedIn, Twitter/X, Website, YouTube, Dribbble, Behance).
- Image uploads go to cloud storage and return a public URL. No server-side image processing (resizing, cropping) is performed.
- Sort order for projects and social links is a simple integer — no drag-and-drop reordering UI is required (users set order manually or it defaults to insertion order).
- The slug availability check is a client-side convenience feature; the server always validates uniqueness on form submission regardless.
- Deleting a profile does not delete the user's authentication account — only the portfolio data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a complete profile (all fields filled) in under 3 minutes.
- **SC-002**: Profile edits (change any field, save) complete with visible feedback in under 2 seconds.
- **SC-003**: Slug availability feedback appears within 1 second of the user stopping typing.
- **SC-004**: 100% of form submissions are validated on the server — no invalid data reaches the database.
- **SC-005**: Image uploads show a preview within 3 seconds of file selection (for files under the size limit).
- **SC-006**: Users can successfully add, edit, and remove projects without affecting other profile data.
- **SC-007**: Profile deletion removes all associated data (social links, projects) with zero orphaned records.
- **SC-008**: All profile management pages are inaccessible to unauthenticated users — 100% redirect to sign-in.
