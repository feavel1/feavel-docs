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
import { z } from 'zod/v4';

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
import { zod4 } from 'sveltekit-superforms/adapters';
import { settingsSchema } from './+page.svelte';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { session, userProfile } = await parent();

	const formData = {
		full_name: userProfile?.full_name ?? null,
		description: userProfile?.description ?? null,
		birthday: userProfile?.birthday ?? null
	};

	return {
		userProfile,
		session,
		form: await superValidate(formData, zod4(settingsSchema))
	};
};
```

### Client-side Implementation (+page.svelte)

```svelte
<script>
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { settingsSchema } from './+page.svelte';

	const { data } = $props();
	const { form: formData } = data;

	const form = superForm(formData, {
		validators: zod4Client(settingsSchema),
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
│   ├── utils/                # Utility functions (posts, storage, etc.)
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

### Consolidated Data Access

The user profile system has been optimized to consolidate user and studio data into a single query:

- **UserProfileWithStudio**: A new interface that includes both user profile information and associated studio data when available
- **getUserProfileWithStudio()**: A utility function that fetches both user and studio data in a single query, reducing database calls
- **Access Patterns**: Use `userProfile.studio?.status` instead of separate `userStudio` variables
- **Performance**: This approach reduces the number of database queries needed to fetch user information

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

## File Handling Best Practices

The project uses a standardized approach for file uploads and management:

- **Upload Process**: Use `FileStorage` service → Image compression (when appropriate) → Database record creation → Entity field update
- **Component Pattern**: File uploads should be handled directly in components, with database updates performed inline rather than in utility functions
- **Reference Implementation**: See `AvatarUpload.svelte` for the recommended implementation pattern
- **Utility Functions**: Helper functions should only handle the file storage upload process, not database updates
- **DEMO**: see AvatarUpload.svelte to understand how files work.

### Service File Upload Pattern

For services with download type, studios can upload two files: preview (public) and product (private).

**Service Files Upload Process**:

- **Utility Class**: Use the `ServiceDownloads` class (`src/lib/utils/serviceDownloads.ts`) for all service file operations. This class handles file uploads, removals, and database linkage.
- **Component Pattern**: Use the specialized components `PreviewFileUpload.svelte` and `ProductFileUpload.svelte` for UI interactions. These components use the `ServiceDownloads` utility class for all operations.
- **Two-file pattern**: Implement separate upload functionality for preview and product files
- **Public vs Private**:
  - Preview files: `is_public: true` in FileStorage options
  - Product files: `is_public: false` in FileStorage options
- **Database linkage**: Use the `service_downloads` table to link services to their files:
  - `preview_file_id` for the preview file storage ID
  - `product_file_id` for the product file storage ID
- **Service Type Check**: The `ServiceDownloads` class validates that the service has type "download" before allowing file operations
- **Access Control**: Product files require purchase verification, preview files are publicly accessible if the service is public
- **Error Handling**: The `ServiceDownloads` class implements manual cleanup if uploads or database operations fail partially. If a file is uploaded but the database operation fails, the file is automatically deleted from storage.
- **File Display**: Use the `ServiceFileDisplay.svelte` component to show files on service pages, with appropriate access controls for product files.

**Reference Implementation**:

- Utility class: `src/lib/utils/serviceDownloads.ts`
- UI components: `src/lib/components/modules/services/PreviewFileUpload.svelte`, `src/lib/components/modules/services/ProductFileUpload.svelte`, `src/lib/components/modules/services/ServiceFileDisplay.svelte`, `src/lib/components/modules/services/ServiceFileManager.svelte`
- Integration examples: `src/routes/studios/dashboard/services/[service_id]/+page.svelte`, `src/routes/services/[service_id]/+page.svelte`

See `.specify/memory/constitution.md` for the complete constitutional document.
