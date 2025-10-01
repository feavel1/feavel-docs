# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Feavel Docs is a modern, full-stack blogging platform built with:

- **Frontend**: SvelteKit 5 with TypeScript and Svelte 5 runes
- **Backend**: Supabase (PostgreSQL, Auth, Storage) `src/lib/types/database.types.ts`
- **UI**: shadcn-svelte components with Tailwind CSS
- **Editor**: Editor.js with advanced plugins
- **i18n**: Paraglide.js for internationalization (EN, CN, RU)
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Forms**: sveltekit-superforms with Zod validation

## Development Commands

### Essential Development Commands

```bash

# Type checking
bun run check              # Type checking with SvelteKit
npm run check              # Alternative with npm

# Code formatting
bun run format             # Format code with Prettier
npm run format             # Alternative with npm
```

## Svelte 5 Runes Patterns

The project uses Svelte 5 runes for state management. Always follow these patterns:

- Use `$state()` for reactive state variables
- Use `$derived()` for computed values
- Use `$effect()` for side effects (replaces onMount)
- Use `$props()` for component props
- Use `let { data } = $props()` for server data in +page.svelte files
- Use `onclick`, `onkeydown`, etc. instead of `on:click`

Example:

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);

	$effect(() => {
		console.log(`Count is now ${count}`);
	});

	let { optionalProp = 42, requiredProp } = $props();
</script>
```

## Form Handling with Superforms

The project uses sveltekit-superforms with Zod for form validation. Follow this pattern:

### Schema Definition (in +page.svelte module script)

```ts
import { z } from 'zod';

export const settingsSchema = z.object({
	full_name: z.string().max(100).nullable(),
	description: z.string().max(500).nullable(),
	birthday: z.string().or(z.literal('')).nullable()
});

export type SettingsSchema = typeof settingsSchema;
```

### Server-side Loading (+page.server.ts)

```ts
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { settingsSchema } from './+page.svelte';

export const load = async ({ parent }) => {
	const { session, userProfile } = await parent();

	const formData = {
		full_name: userProfile?.full_name ?? null,
		description: userProfile?.description ?? null,
		birthday: userProfile?.birthday ?? null
	};

	return {
		userProfile,
		session,
		form: await superValidate(formData, zod(settingsSchema))
	};
};
```

### Client-side Implementation (+page.svelte)

```svelte
<script>
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { settingsSchema } from './+page.svelte';

	const { data } = $props();
	const { form: formData } = data;

	const form = superForm(formData, {
		validators: zodClient(settingsSchema),
		resetForm: false,
		onResult: () => {
			// Focus on first error
			if (form.errors && Object.keys(form.errors).length) {
				requestAnimationFrame(() => {
					document.querySelector < HTMLElement > '[aria-invalid="true"]'?.focus();
				});
			}
		},
		onUpdated({ form }) {
			if (form.message) {
				toast.success(form.message.text);
			}
		}
	});

	const { form: formValues, enhance, submitting, message } = form;
</script>

<form method="POST" use:enhance>
	<input bind:value={$formValues.full_name} />
	<!-- Form fields -->
	<button disabled={$submitting}
		>{#if $submitting}
			Saving...
		{:else}
			Save Changes
		{/if}</button
	>
</form>
```

## Supabase Integration Patterns

Always use the Supabase client provided by SvelteKit hooks:

- Use `event.locals.supabase` in server code (never create new clients)
- Use `event.locals.safeGetSession()` for auth checks
- Use `maybeSingle()` for optional single-record queries
- Implement proper error handling for all Supabase operations
- Validate inputs in `+page.server.ts` actions
- Storage: construct bucket paths carefully; never trust client-provided paths

Example:

```ts
export const load = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();
	return { session, user };
};
```

## Component Architecture

The project follows a modular component structure:

- **UI Components**: `src/lib/components/ui/*` (shadcn-svelte based atomic components)
- **Modules**: `src/lib/components/modules/*` (feature-specific components)
- **Pages**: `src/routes/*` (+page.svelte/+page.server.ts pattern)

Always use existing components when possible and follow the established patterns.

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── modules/          # Feature components (AuthForm, Editor, etc.)
│   │   └── ui/               # shadcn-svelte components
│   ├── utils/                # Utility functions (posts, comments, etc.)
│   ├── stores/               # Svelte stores
│   └── types/                # TypeScript types
├── routes/                   # SvelteKit routes
│   ├── auth/                 # Authentication pages
│   ├── member/               # User profiles
│   ├── posts/                # Blog system
│   ├── demo/                 # Feature demos
│   └── docs/                 # Documentation
└── app.html                  # HTML template
```

## Internationalization (i18n)

The project uses Paraglide.js for internationalization:

- Use `import { m } from '@inlang/paraglide-js';` for translations
- Support for EN, CN, RU locales
- Follow the existing pattern for adding new translations

## Performance Guidelines

- Use select() to limit returned columns in Supabase queries
- Implement pagination for large datasets
- Use indexes for frequently queried columns
- Implement caching for frequently accessed data (like tags)
- Use `maybeSingle()` for optional single-record queries
- Handle string/number ID type conversions explicitly

## Studio System Patterns

The studio system follows specific patterns for handling studio applications and dashboard access:

- **Studio Status Management**: Studios have a status field with values: 'applied', 'approved', 'incomplete', 'disabled', 'blocked'
- **Limited vs Full Access**: Users with 'applied' status get limited dashboard access, while 'approved' users get full access
- **Duplicate Prevention**: Each user can only apply to become a studio once (enforced by unique user_id constraint)
- **Dashboard Navigation**: Studio dashboard follows the same navigation pattern as member dashboard with links to settings, services, and orders pages

### Studio Application Form Handling

Follow the standard form handling pattern with Zod validation for studio applications:

```ts
// Schema definition
import { z } from 'zod';

export const studioApplicationSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().min(1).max(500),
	contact_phone: z.number().positive(),
	salary_expectation: z.string().min(1).max(100)
});

export type StudioApplicationSchema = typeof studioApplicationSchema;
```

## Security Directives

- NEVER trust session data from `auth.getSession()` - it comes from local storage and can be tampered with
- ALWAYS use `auth.getUser()` for server-side operations to get verified user data
- Use `event.locals.safeGetSession()` for auth checks in SvelteKit
- Implement Row Level Security (RLS) policies for all tables
- Validate all inputs on the server side
- Never expose service role keys in client-side code

## Constitutional Principles

This project follows the Feavel Docs Constitution (v1.2.0) which establishes clear patterns for:

1. **Session and Permission Handling**
   - Session validation and permission checks are handled at the hook level (`hooks.server.ts`)
   - Individual route files should not manually check session validity

2. **Parent-Child Data Flow**
   - Data loaded in parent +layout.server.ts files is accessible to child layouts and pages through `await parent()`
   - Child server files should access this data by destructuring the parent result

3. **Supabase Client Usage**
   - In server files, always use `locals.supabase` instead of creating new clients
   - This ensures optimal performance and proper authentication context

4. **Frontend Data Access**
   - Child +page.svelte files can access inherited data directly through props
   - This eliminates the need for redundant data fetching in individual page server files

See `.specify/memory/constitution.md` for the complete constitutional document.
