# Feavel Docs

A modern, full-stack blogging platform built with SvelteKit, Supabase, and shadcn-svelte components. Features rich content editing, user authentication, internationalization, and comprehensive post management.

## 🚀 Features

### ✨ Core Features

- **🔐 Authentication System** - Email-based signup/login with Supabase Auth
- **📝 Rich Content Editor** - Editor.js integration with advanced tools
- **🏷️ Tag System** - Multi-tag selection with filtering and search
- **👤 User Profiles** - Avatar upload and profile management
- **🌍 Internationalization** - Multi-language support (EN, CN, RU)
- **📁 File Storage** - Supabase storage with image compression
- **🎨 Modern UI** - shadcn-svelte components with responsive design

### 📚 Blog Features

- **Rich Content Creation** - Block-based editor with 15+ tools
- **Post Management** - Full CRUD operations with drafts
- **Tag Filtering** - URL-based tag navigation
- **Cover Images** - Optional post cover images
- **View Tracking** - Post view counter
- **Publishing Controls** - Public/private visibility

### 🛠️ Technical Features

- **TypeScript** - Full type safety throughout
- **Testing** - Unit and E2E test suites
- **Performance** - Optimized loading and caching
- **Security** - Row-level security and input validation
- **Accessibility** - WCAG compliant with keyboard navigation

## 🏗️ Architecture

### Tech Stack

- **Frontend**: SvelteKit 5 with TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI**: shadcn-svelte components
- **Editor**: Editor.js with advanced plugins
- **i18n**: Paraglide.js
- **Testing**: Vitest + Playwright

### Database Schema

```sql
-- Users (Supabase Auth)
users (id, username, avatar_url, created_at)

-- Posts
posts (id, user_id, title, content_v2, post_cover, public_visibility, post_views, created_at)

-- Tags
post_tags (id, tag_name, created_at)
posts_tags_rel (id, post_id, tag_id, created_at)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Bun (recommended) or npm
- Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/feavel-docs.git
   cd feavel-docs
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Add your Supabase credentials:

   ```env
   PUBLIC_SUPABASE_URL=your_supabase_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Set up the database**

   ```bash
   # Run the database migrations in your Supabase dashboard
   # or use the Supabase CLI
   ```

5. **Start the development server**

   ```bash
   bun dev
   # or
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📖 Documentation

### User Guides

- [Features Overview](./src/routes/docs/Features.md) - Complete feature documentation
- [Blog Implementation](./src/routes/docs/Blog%20Implementation.md) - Technical implementation details
- [Multi-Tag Selection](./src/routes/docs/MultiTagSelection.md) - Tag system documentation

### API Reference

- **Authentication**: `/auth/login`, `/auth/signup`
- **Posts**: `/posts/new`, `/posts/edit/[id]`, `/posts/[post_id]`
- **Profiles**: `/member/[username]`, `/member/[username]/settings`
- **Demo**: `/demo/storage`, `/demo/paraglide`

## 🎯 Usage Examples

### Creating a Blog Post

1. Navigate to `/posts/new`
2. Enter title and content using the rich editor
3. Select tags from available options or create new ones
4. Set visibility (public/private)
5. Save or publish the post

### Managing Your Profile

1. Visit `/member/[username]/settings`
2. Upload or update your avatar
3. Edit profile information
4. Changes are reflected across the application

### Using Tags

- Click tags on posts to filter by that tag
- Use URL parameters: `/posts?tag=javascript`
- Create new tags while editing posts
- Tags are automatically suggested based on content

### Test Coverage

- Component testing with Vitest
- E2E testing with Playwright
- Form validation testing
- API integration testing

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically on push

### Other Platforms

- **Netlify**: Compatible with SvelteKit
- **Railway**: Full-stack deployment
- **Docker**: Containerized deployment

### Environment Variables

```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🛠️ Development

### Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── modules/          # Feature components
│   │   └── ui/              # shadcn-svelte components
│   ├── utils/               # Utility functions
│   └── hooks/               # Custom hooks
├── routes/                  # SvelteKit routes
│   ├── auth/               # Authentication
│   ├── member/             # User profiles
│   ├── posts/              # Blog system
│   ├── demo/               # Feature demos
│   └── docs/               # Documentation
└── app.html                # HTML template
```

### Available Scripts

```bash
# Development
bun dev                    # Start dev server
bun run check             # Type checking
bun run format            # Format code
bun run lint              # Lint code

# Testing
bun test                  # Run unit tests
bun run test:e2e         # Run E2E tests

# Building
bun run build            # Build for production
bun run preview          # Preview production build
```

### Code Quality

- **TypeScript**: Full type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Svelte Check**: Svelte type checking

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### Code Style

- Follow TypeScript best practices
- Use Svelte 5 runes for state management
- Follow shadcn-svelte component patterns
- Write comprehensive tests
- Adhere to constitutional principles (see `.specify/memory/constitution.md`)

### Testing Guidelines

- Unit test all utility functions
- Component test all new components
- E2E test critical user flows
- Maintain good test coverage

## 📦 Dependencies

### Core Dependencies

```json
{
	"@supabase/supabase-js": "^2.53.0",
	"@supabase/ssr": "^0.6.1",
	"@inlang/paraglide-js": "^2.2.0",
	"sveltekit-superforms": "^2.27.1",
	"svelte-sonner": "^1.0.5"
}
```

### Editor.js Tools

```json
{
	"@editorjs/editorjs": "^2.31.0-rc.10",
	"@editorjs/header": "^2.8.8",
	"@editorjs/list": "^2.0.8",
	"@editorjs/quote": "^2.7.6",
	"@editorjs/code": "^2.9.3",
	"@editorjs/table": "^2.4.5",
	"@editorjs/simple-image": "^1.6.0",
	"editorjs-drag-drop": "^1.1.16",
	"editorjs-undo": "^2.0.28"
}
```

## 🔮 Roadmap

### Planned Features

- [ ] **Search Functionality** - Full-text search implementation
- [ ] **Comment System** - Post commenting and replies
- [ ] **Social Features** - User following and activity feed
- [ ] **Advanced Analytics** - Post analytics and user insights
- [ ] **API Documentation** - Comprehensive API documentation
- [ ] **Mobile App** - React Native companion app

### Technical Improvements

- [ ] **Performance Monitoring** - Real-time performance metrics
- [ ] **Error Tracking** - Comprehensive error logging
- [ ] **SEO Optimization** - Advanced meta tags and structured data
- [ ] **PWA Support** - Progressive web app capabilities
- [ ] **Offline Support** - Service worker implementation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [SvelteKit](https://kit.svelte.dev/) - Full-stack framework
- [Supabase](https://supabase.com/) - Backend-as-a-Service
- [shadcn-svelte](https://www.shadcn-svelte.com/) - UI components
- [Editor.js](https://editorjs.io/) - Rich text editor
- [Paraglide.js](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) - Internationalization

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/feavel-docs/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/feavel-docs/discussions)
- **Documentation**: [Project Docs](./src/routes/docs/)

---

Built with ❤️ using SvelteKit, Supabase, and shadcn-svelte
