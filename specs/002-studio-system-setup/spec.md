# Feature Specification: Studio System Setup

**Feature Branch**: `002-studio-system-setup`
**Created**: 2025-09-24
**Status**: Draft
**Input**: User description: "studio system setup This system has several features: 1. a langing page in /studios; this is a simple page where costumers can see all the studios and what are they into. Also a link to `apply to become a studio`. 2. After a user (already loged in) can apply to become a studio by sending a form request that will take in basic data like studio name, description etc. (see database.types). 3. After approval (done by admin in supabase dashboard, so no complicated logic is needed), the studio-user is able to access studio/dashboard, where he can access all his data and navigate to different dashboard pages. (currently the most important part is to build up UI and UX, other functionalities can be done later, focus on simple queries and simple maintainable code)."

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a visitor, I want to browse all studios on a dedicated landing page so I can learn about available studios and their services. As a logged-in user, I want to apply to become a studio by filling out a form with my studio information. As an approved studio user, I want to access my dashboard where I can manage my studio data.

### Acceptance Scenarios

1. **Given** a visitor is on the homepage, **When** they click on the "Studios" link, **Then** they are taken to the studios landing page showing all studios as cards
2. **Given** a user is logged in, **When** they visit the studios page, **Then** they see a "Apply to become a studio" button
3. **Given** a user clicks "Apply to become a studio", **When** they are redirected to /studios/apply page and fill out the form with studio name, description, contact phone, and salary expectation, **Then** their application is saved with status "applied"
4. **Given** a user has applied to become a studio, **When** they access the studio dashboard, **Then** they see a limited dashboard with basic information while waiting for approval
5. **Given** a studio application is approved by admin in Supabase, **When** the user logs in and accesses the studio dashboard, **Then** they see the full dashboard with navigation links like in /member/dashboard/+layout.svelte
6. **Given** a user is on the studio dashboard, **When** they navigate between dashboard pages, **Then** they can access their studio data

### Edge Cases

- What happens when a non-logged-in user tries to access the studio dashboard? (Should be redirected to login)
- How does the system handle duplicate studio applications from the same user? (Database constraint prevents this)
- What happens when a user tries to access another studio's dashboard? (Security handled by hooks.server.ts)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display a studios landing page at `/studios` showing all approved studios
- **FR-002**: System MUST show an "Apply to become a studio" button to logged-in users on the studios page
- **FR-003**: System MUST allow logged-in users to submit a studio application form containing studio name, description, contact phone, and salary expectation
- **FR-004**: System MUST save studio applications with status "applied" initially
- **FR-005**: System MUST restrict studio dashboard access to only approved studio users
- **FR-006**: System MUST allow approved studio users to navigate between dashboard pages
- **FR-007**: System MUST display studio data in the dashboard based on the logged-in user's studio record
- **FR-008**: System MUST allow users with "applied" status to access a limited studio dashboard with basic information
- **FR-009**: System MUST grant full studio dashboard access only after admin approval changes status to "approved"

### Key Entities

- **Studio**: Represents a studio with attributes name, description, contact_phone, salary_expectation, status, and user_id. Status can be one of: applied, approved, incomplete, disabled, blocked.
- **User**: Represents a platform user with attributes id, full_name, username, avatar_url, birthday, and description.

## Review & Acceptance Checklist

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

## Clarifications

### Session 2025-09-24

- Q: What specific fields should be included in the studio application form based on the Studio entity in database.types.ts? → A: Studio name, description, contact phone, and salary expectation only
- Q: What navigation structure should the studio dashboard have? → A: Simple links like in /member/dashboard/+layout.svelte
- Q: How should studios be displayed on the /studios landing page? → A: as cards
- Q: What is the expected behavior when a user applies to become a studio? → A: User gets limited access immediately with full access after approval
- Q: Where should the studio application form be accessible? → A: On a dedicated /studios/apply page
