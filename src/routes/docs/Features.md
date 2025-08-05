# Features

## Core Features

### Authentication

- User registration and login
- Email confirmation
- Password reset functionality
- Session management

### Blog System

- Create, edit, and delete blog posts
- Rich text editor with EditorJS
- Post cover images
- Post visibility settings (public/private)
- Post views tracking
- **Avatar display in post detail pages using proper Supabase storage URLs**

### User Profiles

- User profile management
- Avatar upload and display
- Profile customization
- Member directory

### Comments System

- Add comments to posts
- Nested comment replies
- Comment moderation
- Real-time comment updates

### Like System

- Like/unlike posts with proper state management
- Real-time like count updates
- User-specific like status tracking
- **Fixed type handling for string/number post IDs**
- **Improved error handling with maybeSingle() queries**

### Tag System

- Multi-tag selection for posts
- Tag-based post filtering
- Tag management

### Search and Filtering

- Post search functionality
- Tag-based filtering
- User-based filtering

### Responsive Design

- Mobile-first design
- Responsive navigation
- Adaptive layouts

## Technical Features

### Svelte 5 Integration

- Modern Svelte 5 runes
- Reactive state management
- Component composition

### UI Components

- Shadcn-Svelte components
- Consistent design system
- Accessible components

### Database

- Supabase integration
- Real-time subscriptions
- Row Level Security (RLS)

### Internationalization

- Paraglide.js integration
- Multi-language support
- Dynamic language switching
