# Blog Features

## Overview

The blog feature provides a comprehensive content management system for users to create, edit, and share posts with rich content and advanced functionality.

## Core Features

### 1. Tag System

- **Tag Management**: Users can add multiple tags to their posts
- **Tag Search**: Users can search posts by tags using URL parameters (e.g., `?tag=javascript`)
- **Tag Display**: Tags are displayed as badges using shadcn-svelte `badge` component
- **Tag Navigation**: Clicking tags filters posts by that tag
- **Tag Storage**: Tags are stored in Supabase `post_tags` table with many-to-many relationship

### 2. Content Search

- **Full-Text Search**: Search through post titles and content
- **Search Integration**: Ready for command palette integration using shadcn-svelte `command` component
- **Search Results**: Display search results with highlighted matches
- **Search History**: Track recent searches for quick access

### 3. Rich Content Editor (✅ Implemented)

- **Block-Based Editor**: Modern Editor.js integration with comprehensive toolset
- **Advanced Tools**: Header, List, Quote, Code, Inline Code, Delimiter, Table, Simple Image, Checklist, Marker, Embed, Warning, Attaches, Link
- **Enhanced Features**:
  - Drag & Drop support with `editorjs-drag-drop`
  - Multi-block selection with `editorjs-multiblock-selection-plugin`
  - Undo/Redo functionality with `editorjs-undo`
  - Color picker for text styling with `editorjs-color-picker`
- **Media Support**: Picture uploads with local storage caching
- **Auto-Save**: Content saved to local storage during editing
- **Publish Workflow**: Images uploaded to Supabase only when post is published
- **Content Types**: Support for text, images, code blocks, lists, quotes, tables, embeds, etc.
- **Paste Handling**: Smart paste handling for HTML, files, and patterns
- **Conversion Tools**: Convert between different block types
- **Sanitization**: Automatic content sanitization for security

### 4. Global Post Component

- **Reusable Component**: Single component for displaying posts across the app
- **Flexible Props**: Accepts `{supabase}`, `{session}`, `{tags}` for different use cases
- **Context-Aware**: Shows edit button only when session matches post author
- **Responsive Design**: Adapts to different container sizes
- **Loading States**: Skeleton loading for better UX

### 5. Post Management

- **CRUD Operations**: Create, read, update, delete posts
- **Draft System**: Save posts as drafts before publishing
- **Version Control**: Track content changes and revisions
- **Publishing Controls**: Public/private visibility settings
- **SEO Optimization**: Meta tags, structured data, and social sharing

### 6. User Experience

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: WCAG compliant with keyboard navigation
- **Performance**: Optimized loading with lazy loading and caching
- **Internationalization**: Support for multiple languages via Paraglide.js
- **Error Handling**: Graceful error states and user feedback

## Technical Requirements

### Database Schema

- **posts**: Main post content with JSONB for rich content
- **post_tags**: Available tags for categorization
- **posts_tags_rel**: Many-to-many relationship between posts and tags
- **RLS Policies**: Row-level security for data protection

### Storage

- **Image Uploads**: Supabase storage for post images
- **Local Storage**: Temporary content caching during editing
- **CDN Integration**: Optimized image delivery

### API Endpoints

- **Post CRUD**: RESTful endpoints for post management
- **Tag Operations**: Tag creation, listing, and filtering
- **Search API**: Full-text search with pagination
- **Upload API**: Image upload with validation

## User Flows

### Creating a Post

1. User navigates to `/blog/new`
2. Editor loads with empty canvas and full toolset
3. User adds content blocks using toolbox or keyboard shortcuts
4. User can drag & drop blocks for reordering
5. User adds tags from existing list or creates new ones
6. User saves draft (local storage) or publishes (Supabase)
7. Images uploaded to storage only on publish

### Searching Posts

1. User enters search term in command palette
2. System searches titles and content
3. Results displayed with highlighted matches
4. User can filter by tags
5. User clicks result to view full post

### Tag Navigation

1. User clicks tag on post or search page
2. URL updates with tag parameter
3. Posts filtered by selected tag
4. Tag highlighted in UI
5. User can combine multiple tags

## Success Metrics

- **User Engagement**: Time spent creating/reading posts
- **Content Quality**: Post completion rates and edit frequency
- **Search Usage**: Search queries and result clicks
- **Tag Adoption**: Tag usage patterns and discovery
- **Performance**: Page load times and editor responsiveness

## Editor.js Features

### Available Tools

- **Header**: Multiple heading levels (H1-H6)
- **List**: Ordered and unordered lists
- **Quote**: Blockquotes with attribution
- **Code**: Syntax-highlighted code blocks
- **Inline Code**: Inline code formatting
- **Delimiter**: Visual separators
- **Table**: Data tables with editing
- **Simple Image**: Image blocks with captions
- **Checklist**: Task lists with checkboxes
- **Marker**: Text highlighting
- **Embed**: External content embedding
- **Warning**: Alert/notice blocks
- **Attaches**: File attachments
- **Link**: URL linking

### Advanced Features

- **Drag & Drop**: Reorder blocks with mouse
- **Multi-block Selection**: Select multiple blocks at once
- **Undo/Redo**: Full undo/redo history
- **Color Picker**: Text color customization
- **Paste Handling**: Smart paste from various sources
- **Conversion**: Convert between block types
- **Sanitization**: Automatic content cleaning
