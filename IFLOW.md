## Project Overview

Feavel Docs is a modern, full-stack blogging platform built with:

- **Frontend**: SvelteKit 5 with TypeScript and Svelte 5 runes
- **Backend**: Supabase (PostgreSQL, Auth, Storage) `src/lib/types/database.types.ts (read-only)`
- **UI**: shadcn-svelte components with Tailwind CSS
- **Editor**: Editor.js with advanced plugins
- **i18n**: Paraglide.js for internationalization (EN, CN, RU)
- **Testing**: Vitest (unit) + Playwright (E2E)

## Development Commands

### Essential Development Commands for bun

```bash

# Type checking
bun run check

```

### Project Structure

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

## Key Architecture Patterns

### Svelte 5 Runes (MUST FOLLOW)

- Use `$state()`, `$derived()`, `$effect()`, and `$props()` instead of Svelte 4 syntax
- Use `let { data } = $props()` for server data in +page.svelte files
- Use `onclick`, `onkeydown`, etc. instead of `on:click`
- Avoid `onMount()`; prefer `$effect()` for side effects

### Data Flow

1. Server-side data fetching in `+page.server.ts` using `locals.supabase`
2. Data passed to components via `$props()`
3. Client state management with Svelte 5 runes (`$state`, `$derived`)
4. Utility functions in `src/lib/utils/` for data operations

### Supabase Integration

- Always use `event.locals.supabase` in server code (never create new clients)
- Use `event.locals.safeGetSession()` for auth checks
- Use `maybeSingle()` for optional single-record queries
- Implement proper error handling for all Supabase operations
- Validate inputs in `+page.server.ts` actions
- Storage: construct bucket paths carefully; never trust client-provided paths

### Component Organization

- **UI Components**: `src/lib/components/ui/*` (shadcn-svelte based atomic components)
- **Modules**: `src/lib/components/modules/*` (feature-specific components)
- **Pages**: `src/routes/*` (+page.svelte/+page.server.ts pattern)

### Internationalization (i18n)

- Use Paraglide.js for translations
- Import translations with `import { m } from '@inlang/paraglide-js';`
- Support for EN, CN, RU locales

## Key Files to Reference

- Component patterns: `src/lib/components/modules/PostCard.svelte`
- Data handling: `src/lib/utils/posts.ts`
- Route structure: `src/routes/posts/[post_id]/+page.svelte`
- Editor integration: `src/lib/components/modules/content/Editor.svelte`
- Authentication: `src/routes/auth/login/+page.svelte`
- Layout: `src/routes/+layout.svelte`

## Security Directives

- NEVER trust session data from `auth.getSession()` - it comes from local storage and can be tampered with
- ALWAYS use `auth.getUser()` for server-side operations to get verified user data
- Use `event.locals.safeGetSession()` for auth checks in SvelteKit
- Implement Row Level Security (RLS) policies for all tables
- Validate all inputs on the server side
- Never expose service role keys in client-side code

## Performance Guidelines

- Use select() to limit returned columns in Supabase queries
- Implement pagination for large datasets
- Use indexes for frequently queried columns
- Implement caching for frequently accessed data (like tags)
- Use `maybeSingle()` for optional single-record queries
- Handle string/number ID type conversions explicitly

## Common Patterns

### Server-side Data Fetching

```typescript
// +page.server.ts
export const load = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();
	return { session, user };
};
```

### Client-side State Management

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);

	$effect(() => {
		console.log(`Count is now ${count}`);
	});
</script>
```

### Component Props

```svelte
<script>
	let { optionalProp = 42, requiredProp } = $props();
</script>
```

## Editor.js Integration

- Uses Editor.js with multiple plugins (Header, List, Quote, Code, etc.)
- Editor component located at `src/lib/components/modules/content/Editor.svelte`
- Supports both read and write modes
- Content stored as JSON in the database

## Tag System

- Tags are stored in `post_tags` table
- Relationships stored in `posts_tags_rel` table
- Utility functions in `src/lib/utils/tags.ts`
- Multi-tag selection component available

## User Profiles

- User data stored in `users` table
- Avatar handling with fallback to DiceBear avatars
- Username validation and availability checking
- Utility functions in `src/lib/utils/user.ts`

## Comments and Likes

- Comments stored in `post_comments` table
- Likes stored in `post_likes` table
- Utility functions in `src/lib/utils/comments.ts` and `src/lib/utils/likes.ts`
- Real-time features available through Supabase

## Database Schema Guidelines

- Use UUIDs for primary keys when appropriate
- Implement proper foreign key relationships
- Add created_at and updated_at timestamps
- Use appropriate data types (text, integer, boolean, jsonb)
- Implement RLS policies for all tables

## Error Handling

- Always check for errors in Supabase responses
- Implement proper error boundaries
- Log errors for debugging
- Show user-friendly error messages

## Code Quality Directives

- Prefer codebase exploration over external search
- Read only the necessary files; avoid opening entire directories if not needed
- Parallelize independent work when possible
- Follow Svelte 5 runes and project conventions consistently
- Keep edits minimal and scoped; do not refactor unrelated code
- After substantive edits: run lint, type-check, tests, and build in that order
