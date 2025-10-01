<!-- Sync Impact Report
Version change: 1.1.0 → 1.2.0 (Minor version bump for enhanced session and Supabase client handling principles)
List of modified principles:
- Supabase Integration Standards → Session and Supabase Client Management
Added sections: None
Removed sections: None
Templates requiring updates: ✅ updated
Follow-up TODOs: None
-->

# Feavel Docs Constitution

## Core Principles

### I. Type Safety First

All code MUST be written in TypeScript with strict type checking enabled. Type errors MUST be resolved before merging. Runtime type checking MUST be implemented for all API inputs using Zod schemas. This ensures code reliability and reduces bugs through compile-time validation.

### II. Component-Based Architecture

The application MUST follow a modular component structure with UI components in `src/lib/components/ui/` and feature components in `src/lib/components/modules/`. Reusable components MUST be implemented using Svelte 5 runes (`$state`, `$derived`, `$effect`) for state management. This promotes code reuse and maintainability.

### III. Session and Supabase Client Management

All database operations MUST use the Supabase client provided by SvelteKit hooks (`event.locals.supabase`). Session validation and permission checks MUST be handled at the hook level (`hooks.server.ts`) rather than in individual route files. Parent-child data flow MUST be implemented through `await parent()` in server files, with inherited data accessed through props in Svelte components. This ensures consistent authentication, optimal performance, and proper data flow throughout the application.

### IV. Performance and Accessibility

All queries MUST use `select()` to limit returned columns. Pagination MUST be implemented for large datasets. All components MUST be accessible with proper ARIA attributes and keyboard navigation support. WCAG compliance is required for all UI elements. This ensures application performance and inclusivity.

## Development Workflow

### Code Quality Standards

- All code MUST pass type checking with `bun run check` AFTER completion
- Code formatting MUST be consistent using Prettier (`bun run format`)
- ESLint MUST be used for code linting
- All new code MUST include appropriate tests
- Type checking with `bun run check` MUST be the final validation step before committing code

### Git Workflow

- Feature branches MUST follow the pattern `[###-feature-name]`
- Commits MUST include descriptive messages following conventional commit format
- Pull requests MUST include a description of changes and testing approach
- All PRs MUST pass CI checks before merging

### Review Process

- All code changes MUST be reviewed by at least one team member
- PR reviews MUST verify compliance with constitutional principles
- Security-sensitive changes MUST be reviewed by a security-aware team member
- Complexity MUST be justified in PR descriptions

## Governance

### Amendment Procedure

This Constitution supersedes all other development practices. Amendments require:

1. Documentation of proposed changes with rationale
2. Team approval through consensus
3. Migration plan for existing code if applicable
4. Update to all dependent templates and documentation

### Versioning Policy

Constitution versioning follows semantic versioning:

- MAJOR: Backward incompatible governance/principle removals or redefinitions
- MINOR: New principle/section added or materially expanded guidance
- PATCH: Clarifications, wording, typo fixes, non-agnostic refinements

### Compliance Review

All PRs/reviews MUST verify compliance with constitutional principles. Violations MUST be documented with justification or refactored. Complexity MUST be justified with clear rationale.

**Version**: 1.2.0 | **Ratified**: 2025-07-24 | **Last Amended**: 2025-09-30