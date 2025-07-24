# SAAS Project Plan

## 1. Project Initialization

- [x] Initialize Bun project and install dependencies: SvelteKit, Tailwind CSS, Shadcn-Svelte, Paraglide.js, Supabase JS client.
- [x] Set up SvelteKit project structure (`src/lib`, `src/routes`, `src/lib/components`, etc.).
- [x] Configure TypeScript with strict mode.
- [x] Set up Tailwind CSS with SvelteKit and configure Shadcn color conventions.
- [x] Integrate Shadcn-Svelte UI components.
- [x] Configure Paraglide.js for i18n (add language files, set up `m` function).
- [x] Set up environment variables for Supabase and other secrets.

## 2. Authentication & User Management

- [x] Integrate Supabase Auth for user sign-up, login, and session management.
- [x] Create login page at `/auth/login`.
- [x] Create signup page at `/auth/signup`.
- [x] Create member profile page at `/member/[slug]` to display user profile.
- [ ] Use [slug] at /routes/
- [ ] Create protected routes and role-based access control in SvelteKit.
- [ ] Build authentication UI (login, register, profile) using Shadcn-Svelte components.
- [ ] build a settings page for users to change stuff in
- [ ] Create [slug] page for users which display their profile.

## 3. Blog Feature

- [ ] Scaffold blog routes: `/blog`, `/blog/[slug]`, `/blog/new`.
- [ ] Integrate the existing post content editor component for blog creation/editing.
- [ ] Implement server-side data fetching for blog posts using Supabase.
- [ ] Add CRUD actions for blog posts (create, read, update, delete) with proper access control.
- [ ] Add SEO meta tags and SSG/SSR for blog pages.

## 4. Services Feature (for Verified Users)

- [ ] Apply for "verified user"
- [ ] Scaffold services routes: `/services`, `/services/new`, `/services/[id]`.
- [ ] Create service upload form (title, description, price, etc.) for verified users.
- [ ] Implement Supabase integration for storing and fetching services.
- [ ] Add UI for verified users to manage their services (edit, delete).
- [ ] Display services to all users with filtering and search.

## 5. Orders Feature (for Normal Users)

- [ ] Scaffold order routes: `/orders`, `/orders/new`, `/orders/[id]`.
- [ ] Allow normal users to create orders for available services.
- [ ] Implement Supabase integration for order creation and management.
- [ ] Add order history and status tracking for users.
- [ ] Implement notifications (email or in-app) for order updates (optional).

## 6. UI/UX & Styling

- [ ] Use Tailwind CSS and Shadcn-Svelte for consistent, accessible UI.
- [ ] Organize components in `src/lib/components/ui` and `src/lib/components/modules`.
- [ ] Implement responsive design and accessibility best practices.
- [ ] Use Svelte transitions and animations for enhanced UX.

## 7. Internationalization (i18n)

- [ ] Set up Paraglide.js with language files in `languages/`.
- [ ] Use the `t` function for all user-facing strings.
- [ ] Support RTL layouts and text scaling.

## 8. API Routes & Server Logic

- [ ] Create API routes in `src/routes/api/` for custom server logic (if needed).
- [ ] Implement error handling and response formatting.
- [ ] Use SvelteKit's hooks for global middleware (e.g., auth checks).

## 9. Performance & SEO

- [ ] Optimize for SSR and SSG where appropriate.
- [ ] Add meta tags and canonical URLs for SEO.
- [ ] Profile and optimize performance (Web Vitals, lazy loading, code splitting).

## 10. Deployment & Monitoring

- [ ] Configure SvelteKit adapter for deployment (e.g., Vercel, Netlify, Bun server).
- [ ] Set up environment variables for production.
- [ ] Add basic monitoring/logging (optional).

## 11. Documentation & Testing

- [ ] Document project structure, setup, and usage in `README.md`.
- [ ] Add comments and types for maintainability.
- [ ] Write basic tests for critical flows (optional).

---

**Note:**

- Follow SvelteKit, Tailwind, and Supabase best practices throughout.
- Use modular, reusable components and organize code for scalability.
- Prioritize accessibility, performance, and internationalization from the start.
