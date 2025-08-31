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

## Development Commands

### Essential Development Commands for bun

```bash
# Development server
bun run dev

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

### Component Organization

- **UI Components**: `src/lib/components/ui/*` (shadcn-svelte based atomic components)
- **Modules**: `src/lib/components/modules/*` (feature-specific components)
- **Pages**: `src/routes/*` (+page.svelte/+page.server.ts pattern)

## Testing

- Unit tests: `*.spec.ts` files with Vitest
- E2E tests: `*.test.ts` files in `e2e/` directory with Playwright
- Run all tests: `bun test`
- Run unit tests: `bun run test:unit`
- Run E2E tests: `bun run test:e2e`

## Key Files to Reference

- Component patterns: `src/lib/components/modules/PostCard.svelte`
- Data handling: `src/lib/utils/posts.ts`
- Route structure: `src/routes/posts/[post_id]/+page.svelte`
- Editor integration: `src/lib/components/modules/Editor.svelte`
- Authentication: `src/routes/auth/login/+page.svelte`
