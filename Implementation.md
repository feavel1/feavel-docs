# Blog Implementation

## Technical Architecture

### Database Schema (Already Implemented)

```sql
-- Posts table (existing)
posts (
  id: bigint PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  title: text,
  content: jsonb,           -- Legacy content
  content_v2: jsonb,        -- New editor content
  post_cover: text,         -- Cover image URL
  public_visibility: boolean DEFAULT false,
  post_views: bigint DEFAULT 1,
  created_at: timestamptz DEFAULT now()
)

-- Tags table (existing)
post_tags (
  id: bigint PRIMARY KEY,
  tag_name: text UNIQUE,
  created_at: timestamptz DEFAULT now()
)

-- Junction table (existing)
posts_tags_rel (
  id: bigint PRIMARY KEY,
  post_id: bigint REFERENCES posts(id),
  tag_id: bigint REFERENCES post_tags(id),
  created_at: timestamptz DEFAULT now()
)
```

## Implementation Tasks

### 1. Tag System Implementation

#### Database Operations

```typescript
// src/lib/utils/tags.ts
export async function getTags(supabase: SupabaseClient) {
	const { data, error } = await supabase.from('post_tags').select('id, tag_name').order('tag_name');
	return { data, error };
}

export async function getPostTags(supabase: SupabaseClient, postId: number) {
	const { data, error } = await supabase
		.from('posts_tags_rel')
		.select(
			`
      tag_id,
      post_tags!inner(id, tag_name)
    `
		)
		.eq('post_id', postId);
	return { data, error };
}

export async function addTagsToPost(supabase: SupabaseClient, postId: number, tagNames: string[]) {
	// Implementation for adding tags to post
}
```

#### URL-based Tag Navigation

```typescript
// src/routes/blog/+page.server.ts
export const load = async ({ url, locals }) => {
	const tag = url.searchParams.get('tag');

	let query = locals.supabase
		.from('posts')
		.select(
			`
      *,
      users!inner(username, avatar_url),
      posts_tags_rel(
        post_tags!inner(tag_name)
      )
    `
		)
		.eq('public_visibility', true);

	if (tag) {
		query = query.eq('posts_tags_rel.post_tags.tag_name', tag);
	}

	const { data: posts } = await query;
	return { posts, currentTag: tag };
};
```

#### Tag Component

```svelte
<!-- src/lib/components/modules/TagBadge.svelte -->
<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { goto } from '$app/navigation';

	let { tag, clickable = true } = $props();

	function handleClick() {
		if (clickable) {
			goto(`/blog?tag=${encodeURIComponent(tag)}`);
		}
	}
</script>

<Badge variant="secondary" class="cursor-pointer hover:bg-primary/10" on:click={handleClick}>
	{tag}
</Badge>
```

### 2. Search Implementation

#### Full-Text Search

```typescript
// src/lib/utils/search.ts
export async function searchPosts(supabase: SupabaseClient, query: string) {
	const { data, error } = await supabase
		.from('posts')
		.select(
			`
      *,
      users!inner(username, avatar_url),
      posts_tags_rel(
        post_tags!inner(tag_name)
      )
    `
		)
		.eq('public_visibility', true)
		.or(`title.ilike.%${query}%,content_v2::text.ilike.%${query}%`)
		.order('created_at', { ascending: false });

	return { data, error };
}
```

#### Command Palette Integration

```svelte
<!-- src/lib/components/modules/SearchCommand.svelte -->
<script lang="ts">
	import { Command } from '$lib/components/ui/command';
	import { searchPosts } from '$lib/utils/search';

	let { supabase } = $props();
	let searchQuery = $state('');
	let searchResults = $state([]);
	let isSearching = $state(false);

	$effect(() => {
		if (searchQuery.length > 2) {
			performSearch();
		}
	});

	async function performSearch() {
		isSearching = true;
		const { data } = await searchPosts(supabase, searchQuery);
		searchResults = data || [];
		isSearching = false;
	}
</script>

<Command>
	<Command.Input placeholder="Search posts..." bind:value={searchQuery} />
	<Command.List>
		{#each searchResults as post}
			<Command.Item value={post.title}>
				<div class="flex items-center gap-2">
					<span>{post.title}</span>
					<span class="text-muted-foreground">by {post.users.username}</span>
				</div>
			</Command.Item>
		{/each}
	</Command.List>
</Command>
```

### 3. Rich Content Editor

#### Editor.js Integration

```typescript
// src/lib/components/modules/Editor.svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import EditorJS from '@editorjs/editorjs';
  import Header from '@editorjs/header';
  import List from '@editorjs/list';
  import Image from '@editorjs/image';

  let { content = '', onChange } = $props();
  let editorContainer: HTMLElement;
  let editor: EditorJS;

  onMount(() => {
    editor = new EditorJS({
      holder: editorContainer,
      data: content,
      tools: {
        header: Header,
        list: List,
        image: {
          class: Image,
          config: {
            uploader: {
              uploadByFile: async (file) => {
                // Upload to local storage first
                const url = URL.createObjectURL(file);
                return { success: 1, file: { url } };
              }
            }
          }
        }
      },
      onChange: () => {
        editor.save().then((data) => {
          onChange?.(data);
        });
      }
    });
  });
</script>

<div bind:this={editorContainer} class="prose max-w-none" />
```

#### Local Storage Integration

```typescript
// src/lib/utils/editor-storage.ts
export function saveDraft(postId: string, content: any) {
	localStorage.setItem(
		`draft_${postId}`,
		JSON.stringify({
			content,
			timestamp: Date.now()
		})
	);
}

export function loadDraft(postId: string) {
	const draft = localStorage.getItem(`draft_${postId}`);
	return draft ? JSON.parse(draft) : null;
}

export function clearDraft(postId: string) {
	localStorage.removeItem(`draft_${postId}`);
}
```

### 4. Global Post Component

#### Reusable Post Component

```svelte
<!-- src/lib/components/modules/PostCard.svelte -->
<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Edit, Eye } from '@lucide/svelte';

	let { post, supabase, session, showEditButton = true, compact = false } = $props();

	let isAuthor = $derived(session?.user?.id === post.user_id);
</script>

<Card class="transition-shadow hover:shadow-md">
	<CardHeader>
		<div class="flex items-start justify-between">
			<CardTitle class="text-xl">{post.title}</CardTitle>
			{#if showEditButton && isAuthor}
				<Button variant="ghost" size="sm">
					<Edit class="h-4 w-4" />
				</Button>
			{/if}
		</div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<span>by {post.users.username}</span>
			<span>•</span>
			<span>{new Date(post.created_at).toLocaleDateString()}</span>
			<span>•</span>
			<span class="flex items-center gap-1">
				<Eye class="h-4 w-4" />
				{post.post_views}
			</span>
		</div>
	</CardHeader>

	<CardContent>
		{#if post.post_cover}
			<img
				src={post.post_cover}
				alt="Post cover"
				class="mb-4 h-48 w-full rounded-md object-cover"
			/>
		{/if}

		<div class="prose mb-4 max-w-none">
			<!-- Render content based on content_v2 structure -->
		</div>

		{#if post.posts_tags_rel?.length > 0}
			<div class="flex flex-wrap gap-2">
				{#each post.posts_tags_rel as relation}
					<Badge variant="secondary">
						{relation.post_tags.tag_name}
					</Badge>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>
```

### 5. Routes Structure

#### Blog Routes

```
src/routes/blog/
├── +page.server.ts          # List posts with tag filtering
├── +page.svelte            # Blog listing page
├── [slug]/
│   ├── +page.server.ts     # Single post data
│   └── +page.svelte        # Single post view
├── new/
│   ├── +page.server.ts     # Create post action
│   └── +page.svelte        # Post editor
└── edit/[id]/
    ├── +page.server.ts     # Update post action
    └── +page.svelte        # Edit post form
```

#### API Routes

```
src/routes/api/
├── posts/
│   ├── +server.ts          # CRUD operations
│   ├── search/+server.ts   # Search endpoint
│   └── [id]/
│       └── +server.ts      # Individual post operations
└── tags/
    └── +server.ts          # Tag management
```

### 6. Development Phases

#### Phase 1: Core Infrastructure

- [ ] Set up blog routes structure
- [ ] Implement basic post CRUD operations
- [ ] Create PostCard component
- [ ] Add tag system database operations
- [ ] Implement tag filtering in URL

#### Phase 2: Editor Integration

- [ ] Install and configure Editor.js
- [ ] Create custom image upload handler
- [ ] Implement local storage for drafts
- [ ] Add auto-save functionality
- [ ] Create post editor page

#### Phase 3: Search & Navigation

- [ ] Implement full-text search
- [ ] Create search command palette
- [ ] Add tag navigation
- [ ] Implement search highlighting
- [ ] Add search history

#### Phase 4: Polish & Optimization

- [ ] Add loading states and skeletons
- [ ] Implement error boundaries
- [ ] Optimize performance with pagination
- [ ] Add SEO meta tags
- [ ] Implement social sharing

### 7. Dependencies

#### New Dependencies

```json
{
	"@editorjs/editorjs": "^2.28.0",
	"@editorjs/header": "^2.8.0",
	"@editorjs/list": "^1.9.0",
	"@editorjs/image": "^2.8.0",
	"@editorjs/quote": "^2.6.0",
	"@editorjs/code": "^2.8.0"
}
```

#### Existing Dependencies (Already Available)

- `@supabase/supabase-js` - Database operations
- `shadcn-svelte` - UI components
- `@lucide/svelte` - Icons
- `sveltekit-superforms` - Form handling

### 8. Testing Strategy

#### Unit Tests

- Tag operations (CRUD)
- Search functionality
- Editor content parsing
- Post component rendering

#### Integration Tests

- Post creation workflow
- Tag filtering
- Search with results
- Draft saving/loading

#### E2E Tests

- Complete post creation flow
- Tag navigation
- Search functionality
- Editor interactions

### 9. Performance Considerations

#### Database Optimization

- Add indexes on `posts.title`, `posts.created_at`
- Add full-text search index on `posts.content_v2`
- Optimize tag queries with proper joins

#### Frontend Optimization

- Implement virtual scrolling for large post lists
- Lazy load images with intersection observer
- Cache search results
- Debounce search input

#### Storage Optimization

- Compress images before upload
- Use WebP format for better compression
- Implement image resizing for different screen sizes
