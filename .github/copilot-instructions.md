# Feavel Docs - AI Agent Instructions

## Project Overview

Feavel Docs is a SvelteKit-based blogging platform using Supabase for backend services. Key technologies:

- SvelteKit 5 + TypeScript for frontend
- Supabase for auth, database, and storage
- shadcn-svelte for UI components
- Editor.js for rich content editing
- Paraglide.js for i18n

## Architecture Patterns

### Component Organization

- UI components: `src/lib/components/ui/*` - shadcn-svelte based atomic components
- Modules: `src/lib/components/modules/*` - Feature-specific components (e.g., `AuthForm`, `CommentSection`)
- Routes: `src/routes/*` - Page components with +page.svelte/+page.server.ts pattern

### Data Flow

- Supabase interactions in `src/lib/utils/*.ts` (e.g., `posts.ts`, `comments.ts`)
- Server-side operations in `+page.server.ts` files
- Client state management in `src/lib/stores/*.ts`

## Development Workflow

### Setup

```bash
bun install  # or npm install
cp .env.example .env  # Add Supabase credentials
bun run dev
```

### Testing

- Unit tests: `bun test` or `bun run test:unit`
- E2E tests: `bun run test:e2e`
- Test files follow `.spec.ts` (unit) or `.test.ts` (E2E) pattern

### Key Patterns

1. **Data Fetching**
   - Use `maybeSingle()` for optional single records
   - Handle string/number ID type conversions explicitly
   - Example: `src/lib/utils/posts.ts`

2. **Authentication**
   - Check auth state in +page.server.ts
   - Protected routes under `/member/*`
   - Use `AuthForm.svelte` for login/signup

3. **Internationalization**
   - Messages in `messages/*.json`
   - Use Paraglide.js translations in components
   - Support for EN, CN, RU locales

4. **Component Development**
   - Extend shadcn-svelte components in `ui/`
   - Create feature modules in `modules/`
   - Follow existing patterns in similar components

## Common Gotchas

- Always use proper types from `src/lib/types/*`
- Handle Supabase storage URLs with proper bucket paths
- Check auth state before protected operations
- Use proper error handling with Supabase queries

## Reference Files

- Component patterns: `src/lib/components/modules/PostCard.svelte`
- Data handling: `src/lib/utils/posts.ts`
- Route structure: `src/routes/posts/[post_id]/+page.svelte`
