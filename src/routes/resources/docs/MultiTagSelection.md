# Multi-Tag Selection System

## Overview

The Multi-Tag Selection system provides an interactive interface for users to select multiple tags for their blog posts. This system includes tag creation, filtering, and visual feedback with a modern UI built using shadcn-svelte components.

## Component Architecture

### MultiTagSelect Component

The main component is located at `src/lib/components/modules/MultiTagSelect.svelte` and provides:

- **Interactive tag selection** with visual feedback
- **Tag creation** for new tags
- **Tag filtering** and search functionality
- **Keyboard navigation** support
- **Accessibility** features

## Features

### 1. Tag Selection Interface

```svelte
<!-- MultiTagSelect.svelte -->
<script lang="ts">
	let { tags = [], selectedTags = [], onTagToggle } = $props();

	function handleTagToggle(tagName: string) {
		if (selectedTags.includes(tagName)) {
			selectedTags = selectedTags.filter((tag) => tag !== tagName);
		} else {
			selectedTags = [...selectedTags, tagName];
		}
		onTagToggle?.(selectedTags);
	}
</script>
```

**Features:**

- Toggle tags on/off with visual feedback
- Maintains selected state
- Calls callback function on changes
- Responsive design for mobile and desktop

### 2. Tag Creation

```svelte
<!-- Tag creation functionality -->
<script lang="ts">
	function handleAddTag(event: KeyboardEvent) {
		const input = event.target as HTMLInputElement;
		if (event.key === 'Enter' && input.value.trim()) {
			const newTag = input.value.trim();
			if (!selectedTags.includes(newTag) && !tags.includes(newTag)) {
				selectedTags = [...selectedTags, newTag];
				onTagToggle?.(selectedTags);
			}
			input.value = '';
		}
	}
</script>
```

**Features:**

- Create new tags by typing and pressing Enter
- Validation to prevent duplicate tags
- Automatic addition to selected tags
- Input clearing after creation

### 3. Visual Design

The component uses shadcn-svelte components for consistent styling:

```svelte
<!-- Tag display with badges -->
<Badge
	variant={selectedTags.includes(tag) ? 'default' : 'secondary'}
	class="cursor-pointer transition-colors hover:bg-primary/10"
	on:click={() => handleTagToggle(tag)}
>
	{tag}
</Badge>
```

**Design Features:**

- **Selected state**: Different badge variants for selected/unselected
- **Hover effects**: Visual feedback on interaction
- **Smooth transitions**: CSS transitions for state changes
- **Responsive layout**: Adapts to different screen sizes

## Database Integration

### Tag Storage

Tags are stored in the Supabase database with the following schema:

```sql
-- Tags table
post_tags (
  id: bigint PRIMARY KEY,
  tag_name: text UNIQUE,
  created_at: timestamptz DEFAULT now()
)

-- Junction table for many-to-many relationship
posts_tags_rel (
  id: bigint PRIMARY KEY,
  post_id: bigint REFERENCES posts(id),
  tag_id: bigint REFERENCES post_tags(id),
  created_at: timestamptz DEFAULT now()
)
```

### Tag Utilities

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

## Usage Examples

### 1. Basic Usage

```svelte
<script lang="ts">
	import { MultiTagSelect } from '$lib/components/modules';

	let availableTags = ['javascript', 'typescript', 'svelte', 'supabase'];
	let selectedTags = ['javascript', 'svelte'];

	function handleTagToggle(tags: string[]) {
		selectedTags = tags;
		console.log('Selected tags:', tags);
	}
</script>

<MultiTagSelect {tags} {selectedTags} onTagToggle={handleTagToggle} />
```

### 2. With Database Integration

```svelte
<script lang="ts">
	import { MultiTagSelect } from '$lib/components/modules';
	import { getTags } from '$lib/utils/tags';

	let { supabase } = $props();
	let availableTags = $state<string[]>([]);
	let selectedTags = $state<string[]>([]);

	$effect(() => {
		loadTags();
	});

	async function loadTags() {
		const { data } = await getTags(supabase);
		if (data) {
			availableTags = data.map((tag) => tag.tag_name);
		}
	}

	function handleTagToggle(tags: string[]) {
		selectedTags = tags;
		// Save to database or form data
	}
</script>

<MultiTagSelect {tags} {selectedTags} onTagToggle={handleTagToggle} />
```

### 3. In Post Editor

```svelte
<!-- src/routes/posts/[post_id]/+page.svelte -->
<script lang="ts">
	let selectedTags = $state<string[]>([]);

	function handleTagToggle(tags: string[]) {
		selectedTags = tags;
	}
</script>

<div class="space-y-4">
	<Label>Tags</Label>
	<MultiTagSelect {tags} {selectedTags} onTagToggle={handleTagToggle} />
	<input type="hidden" name="tags" value={JSON.stringify(selectedTags)} />
</div>
```

## URL-based Tag Filtering

### Implementation

The system supports URL-based tag filtering for browsing posts:

```typescript
// src/routes/posts/+page.server.ts
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

### Tag Navigation

```svelte
<!-- Tag badge with navigation -->
<script lang="ts">
	import { goto } from '$app/navigation';

	function handleTagClick(tag: string) {
		goto(`/posts?tag=${encodeURIComponent(tag)}`);
	}
</script>

<Badge
	variant="secondary"
	class="cursor-pointer hover:bg-primary/10"
	on:click={() => handleTagClick(tag)}
>
	{tag}
</Badge>
```

## Accessibility Features

### Keyboard Navigation

```svelte
<!-- Keyboard support for tag selection -->
<div
	role="button"
	tabindex="0"
	on:keydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleTagToggle(tag);
		}
	}}
>
	{tag}
</div>
```

### Screen Reader Support

```svelte
<!-- ARIA labels and descriptions -->
<div role="region" aria-label="Tag selection" aria-describedby="tag-instructions">
	<div id="tag-instructions" class="sr-only">
		Select tags for your post. Press Enter to create a new tag.
	</div>
	<!-- Tag content -->
</div>
```

## Performance Optimizations

### 1. Efficient Rendering

```svelte
<!-- Optimized tag rendering -->
{#each tags as tag (tag)}
	<Badge
		variant={selectedTags.includes(tag) ? 'default' : 'secondary'}
		class="cursor-pointer hover:bg-primary/10"
		on:click={() => handleTagToggle(tag)}
	>
		{tag}
	</Badge>
{/each}
```

### 2. Debounced Search

```typescript
// Search functionality with debouncing
let searchQuery = $state('');
let debouncedQuery = $state('');

$effect(() => {
	const timeout = setTimeout(() => {
		debouncedQuery = searchQuery;
	}, 300);

	return () => clearTimeout(timeout);
});
```

### 3. Virtual Scrolling (Future Enhancement)

For large tag lists, consider implementing virtual scrolling:

```typescript
// Future implementation
import { VirtualList } from 'svelte-virtual-list';

// Only render visible tags
<VirtualList items={filteredTags} let:item={tag}>
	<TagBadge {tag} />
</VirtualList>
```

## Error Handling

### 1. Network Errors

```typescript
async function loadTags() {
	try {
		const { data, error } = await getTags(supabase);
		if (error) {
			console.error('Failed to load tags:', error);
			// Show user-friendly error message
			return;
		}
		availableTags = data?.map((tag) => tag.tag_name) || [];
	} catch (error) {
		console.error('Unexpected error:', error);
		// Handle unexpected errors
	}
}
```

### 2. Validation Errors

```typescript
function validateTag(tagName: string): boolean {
	if (!tagName.trim()) {
		return false;
	}

	if (tagName.length > 50) {
		return false;
	}

	if (!/^[a-zA-Z0-9_-]+$/.test(tagName)) {
		return false;
	}

	return true;
}
```

## Testing

### Unit Tests

```typescript
// MultiTagSelect.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import MultiTagSelect from './MultiTagSelect.svelte';

describe('MultiTagSelect', () => {
	it('should toggle tags when clicked', async () => {
		const { getByText } = render(MultiTagSelect, {
			props: {
				tags: ['javascript', 'typescript'],
				selectedTags: []
			}
		});

		const tag = getByText('javascript');
		await fireEvent.click(tag);

		// Assert tag is now selected
		expect(tag).toHaveClass('bg-primary');
	});
});
```

### Integration Tests

```typescript
// Tag system integration test
describe('Tag System', () => {
	it('should create and select new tags', async () => {
		// Test tag creation flow
		// Test database integration
		// Test URL filtering
	});
});
```

## Future Enhancements

### 1. Advanced Search

```typescript
// Fuzzy search for tags
import Fuse from 'fuse.js';

const fuse = new Fuse(tags, {
	threshold: 0.3,
	includeScore: true
});

function searchTags(query: string) {
	return fuse.search(query).map((result) => result.item);
}
```

### 2. Tag Categories

```typescript
// Tag categorization
interface TagCategory {
	id: string;
	name: string;
	tags: string[];
}

const tagCategories: TagCategory[] = [
	{
		id: 'languages',
		name: 'Programming Languages',
		tags: ['javascript', 'typescript', 'python', 'rust']
	},
	{
		id: 'frameworks',
		name: 'Frameworks',
		tags: ['svelte', 'react', 'vue', 'angular']
	}
];
```

### 3. Tag Analytics

```typescript
// Tag usage analytics
interface TagAnalytics {
	tagName: string;
	usageCount: number;
	popularity: number;
	relatedTags: string[];
}

async function getTagAnalytics(supabase: SupabaseClient): Promise<TagAnalytics[]> {
	// Implementation for tag analytics
}
```

## Best Practices

### 1. Tag Naming Conventions

- Use lowercase letters
- Separate words with hyphens or underscores
- Keep tags concise (2-3 words max)
- Use consistent terminology

### 2. Performance Guidelines

- Limit the number of tags per post (recommend 5-10)
- Implement tag suggestions based on content
- Cache frequently used tags
- Use pagination for large tag lists

### 3. User Experience

- Provide clear visual feedback for selected tags
- Include helpful instructions for tag creation
- Show tag counts and popularity
- Implement tag autocomplete

### 4. Data Management

- Regularly clean up unused tags
- Merge similar tags when appropriate
- Monitor tag usage patterns
- Implement tag moderation if needed

## Conclusion

The Multi-Tag Selection system provides a robust, user-friendly interface for managing tags in blog posts. With its comprehensive feature set, accessibility support, and performance optimizations, it serves as a solid foundation for content categorization and discovery.
