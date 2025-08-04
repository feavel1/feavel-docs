# Feavel Docs - Project Features

## Overview

Feavel Docs is a comprehensive SvelteKit application that provides a modern blogging platform with user authentication, rich content editing, and internationalization support. Built with SvelteKit, Supabase, and shadcn-svelte components.

## Core Features

### 1. Authentication System ✅

- **User Registration**: Email-based signup with username validation
- **User Login**: Email/password authentication with Supabase Auth
- **Email Verification**: Automatic email confirmation workflow
- **Session Management**: Secure session handling with Supabase SSR
- **Profile Management**: User profiles with avatar upload functionality
- **Username Validation**: Unique username requirements with regex validation

### 2. Rich Content Editor ✅

- **Editor.js Integration**: Modern block-based editor with comprehensive toolset
- **Advanced Tools**:
  - Header (H1-H6), List, Quote, Code blocks, Inline Code
  - Delimiter, Table, Simple Image, Checklist, Marker
  - Embed, Warning, Attaches, Link
- **Enhanced Features**:
  - Drag & Drop support with `editorjs-drag-drop`
  - Multi-block selection with `editorjs-multiblock-selection-plugin`
  - Undo/Redo functionality with `editorjs-undo`
  - Color picker for text styling with `editorjs-color-picker`
- **Content Management**: JSONB storage for rich content in Supabase
- **Auto-Save**: Local storage integration for draft saving
- **Image Handling**: Automatic image compression and upload to Supabase storage

### 3. Blog System ✅

- **Post Creation**: Full CRUD operations for blog posts
- **Rich Content**: Support for text, images, code blocks, lists, quotes, tables, embeds
- **Publishing Controls**: Public/private visibility settings
- **Post Views**: View counter tracking
- **Cover Images**: Optional cover image support for posts
- **Draft System**: Save posts as drafts before publishing

### 4. Tag System ✅

- **Tag Management**: Add multiple tags to posts
- **Tag Storage**: Supabase `post_tags` table with many-to-many relationships
- **Tag Display**: Tags displayed as badges using shadcn-svelte components
- **Tag Filtering**: URL-based tag filtering (e.g., `?tag=javascript`)
- **Multi-Tag Selection**: Interactive tag selection component

### 5. User Profiles ✅

- **Profile Pages**: Individual user profile pages at `/member/[username]`
- **Avatar Upload**: Image upload with automatic compression
- **Profile Settings**: User profile editing interface
- **Avatar Management**: Upload, update, and remove profile pictures
- **Storage Integration**: Supabase storage for avatar files

### 6. Internationalization ✅

- **Paraglide.js Integration**: Modern i18n solution
- **Multi-language Support**: English (en), Chinese (cn), Russian (ru)
- **Language Switching**: Dynamic locale switching
- **Message Management**: Centralized message files in `messages/` directory

### 7. File Storage System ✅

- **Supabase Storage**: File upload, download, and management
- **Image Compression**: Automatic image optimization
- **File Validation**: Type and size validation
- **CDN Integration**: Optimized file delivery
- **Demo Interface**: Storage demonstration page

### 8. UI/UX Features ✅

- **shadcn-svelte Components**: Comprehensive UI component library
- **Responsive Design**: Mobile-first responsive layout
- **Dark Mode Support**: Theme switching capabilities
- **Loading States**: Skeleton loading and progress indicators
- **Toast Notifications**: User feedback with svelte-sonner
- **Form Handling**: Superforms integration for type-safe forms

## Technical Architecture

### Database Schema (Supabase)

```sql
-- Users table (Supabase Auth)
users (
  id: uuid PRIMARY KEY,
  username: text UNIQUE,
  avatar_url: text,
  created_at: timestamptz DEFAULT now()
)

-- Posts table
posts (
  id: bigint PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  title: text,
  content: jsonb,           -- Legacy content
  content_v2: jsonb,        -- Editor.js content
  post_cover: text,         -- Cover image URL
  public_visibility: boolean DEFAULT false,
  post_views: bigint DEFAULT 1,
  created_at: timestamptz DEFAULT now()
)

-- Tags table
post_tags (
  id: bigint PRIMARY KEY,
  tag_name: text UNIQUE,
  created_at: timestamptz DEFAULT now()
)

-- Junction table
posts_tags_rel (
  id: bigint PRIMARY KEY,
  post_id: bigint REFERENCES posts(id),
  tag_id: bigint REFERENCES post_tags(id),
  created_at: timestamptz DEFAULT now()
)
```

### Storage Structure

```
storage/
├── avatars/          # User profile pictures
└── demo/             # Demo file uploads
```

### Routes Structure

```
src/routes/
├── auth/             # Authentication pages
│   ├── login/        # Sign in
│   ├── signup/       # Sign up
│   └── confirm/      # Email confirmation
├── member/           # User profiles
│   └── [slug]/       # Individual user pages
├── posts/            # Blog system
│   ├── new/          # Create post
│   ├── edit/[id]/    # Edit post
│   └── [post_id]/    # View post
├── demo/             # Feature demonstrations
│   ├── storage/      # File storage demo
│   └── paraglide/    # i18n demo
└── docs/             # Documentation
```

## Development Features

### Testing

- **Unit Testing**: Vitest integration
- **E2E Testing**: Playwright test suite
- **Component Testing**: Svelte component testing

### Code Quality

- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Svelte Check**: Type checking for Svelte files

### Development Tools

- **Hot Reload**: Fast development with Vite
- **Type Checking**: Real-time TypeScript validation
- **Form Validation**: Zod schema validation
- **State Management**: Svelte 5 runes for reactive state

## Dependencies

### Core Dependencies

- **SvelteKit**: Full-stack framework
- **Supabase**: Backend-as-a-Service
- **shadcn-svelte**: UI component library
- **Editor.js**: Rich text editor
- **Paraglide.js**: Internationalization

### Editor.js Tools

- **Core**: `@editorjs/editorjs`
- **Blocks**: Header, List, Quote, Code, Table, Image
- **Enhancements**: Drag & Drop, Undo/Redo, Multi-selection, Color picker

### Development Dependencies

- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS
- **Vitest**: Unit testing
- **Playwright**: E2E testing

## User Flows

### Authentication Flow

1. User visits `/auth/signup`
2. Enters email, password, and username
3. System validates username availability
4. Account created with email verification
5. User receives confirmation email
6. User can sign in at `/auth/login`

### Blog Post Creation

1. User navigates to `/posts/new`
2. Editor loads with full toolset
3. User adds content blocks and title
4. User selects tags from available options
5. User sets visibility (public/private)
6. Post saved to Supabase with rich content

### Profile Management

1. User visits `/member/[username]/settings`
2. User can upload/update avatar
3. Image automatically compressed and stored
4. Profile information displayed and editable
5. Changes reflected across the application

## Performance Optimizations

### Frontend

- **Lazy Loading**: Component and route lazy loading
- **Image Optimization**: Automatic compression and WebP support
- **Caching**: Local storage for drafts and user preferences
- **Bundle Optimization**: Tree shaking and code splitting

### Backend

- **Database Indexing**: Optimized queries with proper indexes
- **Storage CDN**: Fast file delivery through Supabase CDN
- **RLS Policies**: Row-level security for data protection
- **Connection Pooling**: Efficient database connections

## Security Features

- **Authentication**: Supabase Auth with email verification
- **Authorization**: Row-level security policies
- **Input Validation**: Zod schema validation
- **File Upload Security**: Type and size validation
- **XSS Protection**: Content sanitization
- **CSRF Protection**: Built-in SvelteKit protection

## Future Enhancements

### Planned Features

- **Search Functionality**: Full-text search implementation
- **Comment System**: Post commenting and replies
- **Social Features**: User following and activity feed
- **Advanced Analytics**: Post analytics and user insights
- **API Documentation**: Comprehensive API documentation
- **Mobile App**: React Native companion app

### Technical Improvements

- **Performance Monitoring**: Real-time performance metrics
- **Error Tracking**: Comprehensive error logging
- **SEO Optimization**: Advanced meta tags and structured data
- **PWA Support**: Progressive web app capabilities
- **Offline Support**: Service worker implementation
