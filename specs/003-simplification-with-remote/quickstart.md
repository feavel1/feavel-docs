# Quickstart Guide: Remote Functions Implementation

## Overview

This guide provides instructions for implementing and using Svelte remote functions to simplify data fetching in the Feavel Docs application. The focus is on maximizing Supabase's selective single fetch joins to minimize JavaScript mapping operations. Not all data should be coupled in a single fetch - pagination-aware data like post comments should be handled separately to maintain proper pagination functionality.

## Prerequisites

- SvelteKit 5 with TypeScript
- Svelte 5 runes enabled
- Supabase configured
- Understanding of async/await patterns
- Knowledge of Supabase join syntax

## Implementation Steps

### 1. Create Remote Function Files

Create remote function files in `src/lib/remote/`:

1. `posts.remote.ts` - Posts-related remote functions
2. `services.remote.ts` - Services-related remote functions
3. `tags.remote.ts` - Tag-related remote functions
4. Update `chat.remote.ts` - Chat-related remote functions

### 2. Define Remote Functions

Use the appropriate Svelte remote function patterns with Supabase optimization:

#### For Build-time Data (Static)

```typescript
import { prerender } from '$app/server';
import { supabase } from '$lib/server/supabase';

export const getMostUsedTags = prerender(async () => {
	// Fetch data that doesn't change frequently using efficient Supabase queries
	// This runs at build time only
	const { data, error } = await supabase
		.from('posts_tags_rel')
		.select('posts_tags!inner(tag_name)');

	if (error) {
		console.error('Error fetching most used tags:', error);
		return [];
	}

	// Minimal JavaScript processing - let Supabase do the work
	const tagCounts = {};
	data.forEach((item) => {
		const tagName = item.posts_tags?.tag_name;
		if (tagName) {
			tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
		}
	});

	return Object.entries(tagCounts)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 5)
		.map(([name]) => name);
});
```

#### For Server-side Data Fetching with Supabase Joins

```typescript
import { query } from '$app/server';
import { z } from 'zod/v4';
import { supabase } from '$lib/server/supabase';

export const getPost = query(
	z.number(), // Input validation
	async (postId) => {
		// Single query with selective joins to fetch core related data
		// Pagination-aware data like comments are handled separately
		// This minimizes JavaScript mapping by letting Supabase do the work
		const { data: post, error } = await supabase
			.from('posts')
			.select(
				`
        *,
        users!inner(username, avatar_file_id),
        posts_tags_rel(
          posts_tags!inner(id, tag_name)
        ),
        posts_likes(
          id,
          user_id,
          created_at,
          users!inner(username, avatar_file_id)
        )
        // Note: posts_comments are NOT included as they require pagination
        // Use getPostComments() for comments
      `
			)
			.eq('id', postId)
			.single();

		if (error) {
			console.error('Database error:', error);
			return null;
		}

		// Return the post with core related data - no JavaScript mapping needed
		return post;
	}
);

// Separate function for paginated comments
export const getPostComments = query(
	z.object({
		postId: z.number(),
		limit: z.number().optional(),
		offset: z.number().optional()
	}),
	async ({ postId, limit = 10, offset = 0 }) => {
		const { data: comments, error } = await supabase
			.from('posts_comments')
			.select(
				`
        id,
        created_at,
        updated_at,
        user_id,
        parent_id,
        content,
        is_deleted,
        users!inner(username, avatar_file_id, full_name)
      `
			)
			.eq('post_id', postId)
			.eq('is_deleted', false)
			.order('created_at', { ascending: true })
			.range(offset, offset + limit - 1);

		if (error) {
			console.error('Database error:', error);
			return [];
		}

		return comments;
	}
);
```

#### For Data Mutations with Database Optimization

```typescript
import { command } from '$app/server';
import { z } from 'zod/v4';
import { supabase } from '$lib/server/supabase';

export const sendMessage = command(
	z.object({
		conversation_id: z.string(),
		message: z.string().max(1000),
		sent_from: z.string()
	}),
	async ({ conversation_id, message, sent_from }) => {
		// Check rate limit using database query instead of in-memory store
		const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
		const { count, error: countError } = await supabase
			.from('chat_messages')
			.select('*', { count: 'exact', head: true })
			.eq('sent_from', sent_from)
			.gt('created_at', oneMinuteAgo);

		if (countError) {
			console.error('Rate limit check error:', countError);
			throw new Error('Failed to check rate limit');
		}

		// Max 10 messages per minute
		if (count && count >= 10) {
			throw new Error('Rate limit exceeded. Please wait before sending more messages.');
		}

		// Insert message into database
		const { data: newMessage, error } = await supabase
			.from('chat_messages')
			.insert({
				conversation_id,
				message,
				sent_from
			})
			.select()
			.single();

		if (error) {
			console.error('Database error:', error);
			return null;
		}

		return newMessage;
	}
);
```

### 3. Use Remote Functions in Components

Replace existing data fetching patterns with remote function calls that leverage Supabase joins:

#### Before (Complex Server Loading with JavaScript Processing)

```typescript
// In +page.server.ts
export const load = async ({ locals }) => {
	// Multiple queries with JavaScript mapping
	const { data: posts } = await locals.supabase.from('posts').select('*');
	const { data: users } = await locals.supabase.from('users').select('*');
	const { data: tags } = await locals.supabase.from('posts_tags').select('*');

	// Complex JavaScript mapping to combine data
	const postsWithUsers = posts.map((post) => ({
		...post,
		user: users.find((user) => user.id === post.user_id)
	}));

	const postsWithTags = postsWithUsers.map((post) => ({
		...post,
		tags: tags.filter((tag) => tag.post_id === post.id)
	}));

	return { posts: postsWithTags };
};
```

#### After (Component-level Data Fetching with Supabase Joins)

```typescript
// In +page.svelte
<script>
  import { getPublicPosts } from '$lib/remote/posts.remote';

  let { data } = $props();
  let posts = $state(data.posts || []);
  let loading = $state(true);

  $effect(async () => {
    loading = true;
    // Single query with all related data - no JavaScript mapping needed
    posts = await getPublicPosts({ limit: 10 });
    loading = false;
  });
</script>
```

### 4. Error Handling

Implement consistent error handling in remote functions:

```typescript
export const getPost = query(z.number(), async (postId) => {
	try {
		// Single query with selective joins
		const { data: post, error } = await supabase
			.from('posts')
			.select(
				`
          *,
          users!inner(username, avatar_file_id),
          posts_tags_rel(
            posts_tags!inner(id, tag_name)
          )
        `
			)
			.eq('id', postId)
			.single();

		if (error) {
			console.error('Database error:', error);
			// Return structured error information instead of throwing
			return { success: false, error: 'Post not found', data: null };
		}

		return { success: true, data: post, error: null };
	} catch (error) {
		console.error('Unexpected error:', error);
		return { success: false, error: 'Internal server error', data: null };
	}
});
```

## Posts System Refactoring

### 1. Create Posts Remote Functions

File: `src/lib/remote/posts.remote.ts`

Functions to implement:

- `getDrafts(userId: string)` - Fetch user's draft posts with related data (no comments)
- `getPublicPosts(options?: { limit?: number, offset?: number })` - Fetch public posts with related data (no comments)
- `getPost(postId: number)` - Fetch a single post with related data (no comments)
- `getPostsByTag(tagName: string)` - Fetch posts by tag with related data (no comments)
- `getPostComments(postId: number, options?: { limit?: number, offset?: number })` - Fetch paginated comments for a post

### 2. Update Posts Routes

Remove complex queries from:

- `src/routes/posts/+page.server.ts`
- `src/routes/posts/[post_id]/+page.server.ts`

### 3. Simplify Posts Utilities

Refactor `src/lib/utils/posts.ts` to remove data fetching logic and keep only client-side utilities.

## Services System Refactoring

### 1. Create Services Remote Functions

File: `src/lib/remote/services.remote.ts`

Functions to implement:

- `getServiceCategories()` - Fetch all service categories with related data
- `getService(serviceId: string)` - Fetch a service with all related data
- `getServiceFiles(serviceId: string)` - Fetch service with file download information

### 2. Update Services Routes

Simplify:

- `src/routes/services/+page.server.ts`
- `src/routes/services/[service_id]/+page.server.ts`

## Chat System Refactoring

### 1. Implement Chat Remote Functions

Update: `src/lib/remote/chat.remote.ts`

Implement all functions with clear, descriptive naming:

- `getUserConversations(userId: string)`
- `getConversationMessages(conversationId: string, options: { limit?: number, before?: string })`
- `sendMessage(data: { conversation_id: string, message: string, sent_from: string })`

### 2. Simplify Chat Utilities

Refactor `src/lib/utils/chatUtils.ts` to remove server-side logic and keep only client-side utilities.

## Testing the Implementation

### 1. Verify Data Consistency

Ensure remote functions return the same data structure as previous implementations but with better performance.

### 2. Check Error Handling

Verify error handling works correctly and provides meaningful feedback.

### 3. Performance Testing

Compare loading times before and after refactoring to ensure Supabase joins provide performance benefits.

## Common Patterns

### Async Data Loading in Components with Supabase Optimization

```typescript
<script>
  import { getPost } from '$lib/remote/posts.remote';

  let { data } = $props();
  let post = $state(null);
  let loading = $state(true);
  let error = $state(null);

  $effect(async () => {
    try {
      loading = true;
      // Single query with all related data - no JavaScript mapping needed
      const result = await getPost(data.post_id);
      if (result.success) {
        post = result.data;
      } else {
        error = result.error;
      }
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });
</script>
```

### Handling Loading States

```svelte
{#if loading}
	<div>Loading...</div>
{:else if error}
	<div>Error: {error}</div>
{:else if post}
	<PostDisplay {post} />
{:else}
	<div>No post found</div>
{/if}
```

## Migration Checklist

### Posts System

- [ ] Create `posts.remote.ts` with clear, descriptive function names
- [ ] Implement post remote functions with minimal JavaScript processing
- [ ] Update post route files to remove complex queries
- [ ] Simplify post utilities to remove data fetching logic
- [ ] Test data consistency and performance improvements

### Services System

- [ ] Create `services.remote.ts` with clear, descriptive function names
- [ ] Implement service remote functions with minimal JavaScript processing
- [ ] Update service route files to remove complex queries
- [ ] Simplify service utilities to remove data fetching logic
- [ ] Test data consistency and performance improvements

### Chat System

- [ ] Implement chat remote functions with clear, descriptive function names
- [ ] Update chat components to use remote functions
- [ ] Simplify chat utilities to remove server-side logic
- [ ] Test real-time functionality and performance improvements

## Troubleshooting

### Remote Function Not Found

- Check import paths
- Verify function names match exports
- Ensure remote function files are in correct location

### Type Errors

- Check Zod schema definitions
- Verify return types match expectations
- Ensure proper type casting

### Performance Issues

- Check Supabase query complexity
- Verify join syntax is correct
- Profile database query performance
- Consider adding database indexes for frequently queried columns

## Best Practices for Supabase Join Optimization

### 1. Use Complex Joins Instead of Multiple Queries

```typescript
// Instead of multiple queries and JavaScript mapping:
const { data: posts } = await supabase.from('posts').select('*');
const { data: users } = await supabase.from('users').select('*');
const postsWithUsers = posts.map((post) => ({
	...post,
	user: users.find((user) => user.id === post.user_id)
}));

// Use a single query with joins:
const { data: postsWithUsers } = await supabase.from('posts').select(`
    *,
    users!inner(username, avatar_file_id)
  `);
```

### 2. Leverage Supabase's Built-in Filtering

```typescript
// Instead of fetching all data and filtering in JavaScript:
const { data: allMessages } = await supabase.from('chat_messages').select('*');
const recentMessages = allMessages.filter((msg) => new Date(msg.created_at) > oneMinuteAgo);

// Use Supabase's built-in filtering:
const { data: recentMessages } = await supabase
	.from('chat_messages')
	.select('*')
	.gt('created_at', oneMinuteAgo.toISOString());
```

### 3. Use Selective Column Fetching

```typescript
// Instead of fetching all columns:
const { data: posts } = await supabase.from('posts').select('*');

// Fetch only needed columns:
const { data: posts } = await supabase.from('posts').select('id, title, created_at, user_id');
```

### 4. Combine Operations in Single Queries

```typescript
// Instead of separate queries for counting and fetching:
const { count } = await supabase.from('posts').select('*', { count: 'exact', head: true });
const { data: posts } = await supabase.from('posts').select('*').limit(10);

// Use range for pagination:
const { data: posts } = await supabase.from('posts').select('*').range(0, 9);
```
