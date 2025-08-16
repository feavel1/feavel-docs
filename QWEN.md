# Project Context for Qwen Code

## Project Overview

**Feavel Docs** is a modern, full-stack blogging platform built with SvelteKit 5, Supabase, and shadcn-svelte components. The project features rich content editing with Editor.js, user authentication, internationalization, and comprehensive post management.

### Core Features

- Authentication System with Supabase Auth
- Rich Content Editor using Editor.js with 15+ tools
- Multi-tag selection with filtering and search
- User profiles with avatar upload
- Internationalization support (EN, CN, RU)
- Supabase storage with image compression
- Modern UI with shadcn-svelte components

### Tech Stack

- **Frontend**: SvelteKit 5 with TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI**: shadcn-svelte components with TailwindCSS
- **Editor**: Editor.js with advanced plugins
- **i18n**: Paraglide.js
- **Testing**: Vitest + Playwright

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── modules/          # Feature components
│   │   └── ui/              # shadcn-svelte components
│   ├── hooks/               # Custom hooks
│   ├── stores/              # Svelte stores
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   └── index.ts             # Library exports
├── routes/                  # SvelteKit routes
│   ├── api/                 # API endpoints
│   ├── auth/                # Authentication
│   ├── demo/                # Feature demos
│   ├── docs/                # Documentation
│   ├── member/              # User profiles
│   ├── posts/               # Blog system
│   └── +layout files        # Root layout
├── app.css                  # Global CSS
├── app.d.ts                 # TypeScript declarations
├── app.html                 # HTML template
└── hooks.ts/server.ts       # SvelteKit hooks
```

## Development Environment

### Prerequisites

- Node.js 18+
- Bun (recommended) or npm
- Supabase account

### Key Dependencies

- **SvelteKit**: Full-stack framework
- **Supabase**: Backend services (auth, database, storage)
- **shadcn-svelte**: UI component library
- **Editor.js**: Rich text editor with plugins
- **TailwindCSS**: Utility-first CSS framework
- **Paraglide.js**: Internationalization
- **Vitest/Playwright**: Testing frameworks

## Available Scripts

### Development

```bash
bun dev          # Start development server
bun run check    # Type checking

```

### Building

```bash
bun run build    # Build for production
bun run preview  # Preview production build
```

## Configuration Files

### Core Configurations

- `svelte.config.js`: SvelteKit configuration with auto adapter
- `vite.config.ts`: Vite build configuration with TailwindCSS and Paraglide plugins
- `tsconfig.json`: TypeScript configuration with strict settings
- `components.json`: shadcn-svelte component configuration
- `eslint.config.js`: ESLint configuration with TypeScript and Svelte support
- `playwright.config.ts`: Playwright E2E testing configuration

### Code Quality Tools

- **TypeScript**: Full type safety with strict settings
- **ESLint**: Code linting with custom rules
- **Prettier**: Code formatting with TailwindCSS plugin
- **Svelte Check**: Svelte-specific type checking

## Database Schema

The project uses Supabase with the following schema:

```sql
-- Users (Supabase Auth managed)
users (id, username, avatar_url, created_at)

-- Posts
posts (id, user_id, title, content_v2, post_cover, public_visibility, post_views, created_at)

-- Tags
post_tags (id, tag_name, created_at)
posts_tags_rel (id, post_id, tag_id, created_at)
```

## Environment Variables

Required environment variables in `.env`:

```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Development Conventions

### Code Style

- TypeScript with strict type checking
- Svelte 5 runes for state management
- shadcn-svelte component patterns
- TailwindCSS utility classes
- Prettier formatting with 2-space indentation

### Testing Practices

- Unit testing with Vitest for utility functions and components
- E2E testing with Playwright for critical user flows
- Comprehensive test coverage for new features

### Component Structure

- Reusable components in `src/lib/components`
- Route-specific components in respective route directories
- shadcn-svelte UI components in `src/lib/components/ui`
- Feature modules in `src/lib/components/modules`

## Deployment

### Recommended Platforms

- Vercel (with GitHub integration)
- Netlify
- Railway
- Docker containerized deployment

The project uses `@sveltejs/adapter-auto` which automatically detects the deployment platform.

## Testing Setup

### Unit Testing

- Framework: Vitest
- Configuration: `vitest.config.ts` (inferred)
- Test files: `*.test.ts` alongside components

### E2E Testing

- Framework: Playwright
- Configuration: `playwright.config.ts`
- Test directory: `e2e/`

## Internationalization

The project uses Paraglide.js for internationalization:

- Supported languages: English, Chinese, Russian
- Translation files: Managed by Paraglide in `src/lib/paraglide`
- Language detection: URL strategy, cookie, base locale

## Key Routes

### Authentication

- `/auth/login` - Login page
- `/auth/signup` - Signup page

### Blog System

- `/posts` - Blog posts listing
- `/posts/new` - Create new post
- `/posts/edit/[id]` - Edit existing post
- `/posts/[post_id]` - View single post

### User Profiles

- `/member/[username]` - User profile
- `/member/[username]/settings` - Profile settings

### Demos

- `/demo/storage` - File storage demo
- `/demo/paraglide` - Internationalization demo

## Editor.js Integration

The project uses Editor.js as the rich content editor with these tools:

- Header, List, Quote, Code, Table
- Simple Image, Embed, Link
- Checklist, Warning, Delimiter
- Color Picker, Drag-Drop, Undo

## Contributing Guidelines

1. Fork the repository
2. Create a feature branch
3. Make changes with comprehensive tests
4. Follow TypeScript best practices
5. Use Svelte 5 runes for state management
6. Submit pull request with description

## Future Roadmap

Planned features include:

- Full-text search functionality
- Comment system with replies
- Social features (following, activity feed)
- Advanced analytics
- Mobile app companion
- Performance monitoring
- Offline support
