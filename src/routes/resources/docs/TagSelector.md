# Improved Post Management Architecture

## Overview

The post management system has been refactored to use a more interconnected architecture with client-side API calls and improved server logic. This approach provides better user experience, cleaner code, and more reliable tag handling.

## Architecture Changes

### **Server-Side Improvements**

#### **Simplified Server Files**

- **New Post**: `src/routes/posts/new/+page.server.ts` - Only handles authentication and tag loading
- **Edit Post**: `src/routes/posts/edit/[id]/+page.server.ts` - Only handles authentication, post loading, and tag loading
- **Removed Actions**: All form actions moved to client-side API calls

#### **API Endpoints**

- **`/api/posts`**: Handles POST (create), PUT (update), DELETE (delete) operations
- **Utility Functions**: Uses existing utility functions for tag operations

### **Client-Side Improvements**

#### **Interactive Forms**

- **No Form Actions**: Uses client-side fetch calls instead of form submissions
- **Real-time Feedback**: Toast notifications for success/error states
- **Better UX**: Immediate feedback without page reloads

#### **Tag Management**

- **Consistent Loading**: Tags are properly loaded and displayed
- **New Tag Creation**: Users can create new tags via input field
- **MultiTagSelect Integration**: Uses the same component as `/posts` page
- **Reactive Tag Store**: New tags are immediately reflected in the MultiTagSelect component

## Reactive Tag Store Solution

### **Problem Solved**

The main issue was that when new tags were added via `handleAddTag`, they weren't being reflected in the `MultiTagSelect` component because the `tags` prop wasn't reactive.

### **Solution: Reactive Tag Store**

Created `src/lib/stores/tags.ts` to manage available tags across components:

```typescript
import { writable } from 'svelte/store';

export interface Tag {
	id: number;
	tag_name: string;
}

// Create a writable store for available tags
export const availableTags = writable<Tag[]>([]);

// Helper function to add a new tag to the store
export function addNewTag(tagName: string) {
	availableTags.update((tags) => {
		// Check if tag already exists
		const exists = tags.some((tag) => tag.tag_name === tagName);
		if (!exists) {
			// Add new tag with a unique ID
			const newId = Math.max(...tags.map((t) => t.id), -1) + 1;
			return [...tags, { id: newId, tag_name: tagName }];
		}
		return tags;
	});
}

// Helper function to initialize tags from server data
export function initializeTags(tagNames: string[]) {
	const tags = tagNames.map((tagName, index) => ({ id: index, tag_name: tagName }));
	availableTags.set(tags);
}
```

### **Implementation in Components**

#### **New Post Page**

```svelte
<script>
	import { availableTags, initializeTags, addNewTag } from '$lib/stores/tags';

	let { data } = $props();
	let { tags } = data;

	// Initialize the tag store with server data
	$effect(() => {
		if (tags && Array.isArray(tags)) {
			initializeTags(tags);
		}
	});

	function handleAddTag(event: KeyboardEvent) {
		const input = event.target as HTMLInputElement;
		if (event.key === 'Enter' && input.value.trim()) {
			const newTag = input.value.trim();

			// Add the new tag to the store
			addNewTag(newTag);

			// Add to selected tags if not already selected
			if (!selectedTags.includes(newTag)) {
				selectedTags = [...selectedTags, newTag];
			}

			// Clear the input
			input.value = '';

			// Show success feedback
			toast.success(`Tag "${newTag}" added successfully!`);
		}
	}
</script>

<MultiTagSelect
	tags={$availableTags}
	bind:selectedTags
	placeholder="Select tags..."
	label="Available Tags"
	showSearch={true}
/>
```

#### **Edit Post Page**

Uses the same pattern as the new post page, with additional pre-population of selected tags from the existing post.

## Implementation Details

### **API Endpoints**

#### **POST /api/posts** - Create Post

```typescript
{
	title: string;
	content: any;
	cover?: string;
	public_visibility: boolean;
	tags: string[];
}
```

#### **PUT /api/posts** - Update Post

```typescript
{
	id: string;
	title: string;
	content: any;
	cover?: string;
	public_visibility: boolean;
	tags: string[];
}
```

#### **DELETE /api/posts** - Delete Post

```typescript
{
	id: string;
}
```

### **Utility Functions Used**

The API endpoints leverage existing utility functions:

- `addTagsToPost()`: Adds tags to a post
- `updatePostTags()`: Updates post tags (removes old, adds new)
- `removeTagsFromPost()`: Removes all tags from a post
- `getTags()`: Fetches available tags
- `getPostTags()`: Fetches tags for a specific post

### **Client-Side Implementation**

#### **New Post Page**

```svelte
async function handleSubmit() {
	const response = await fetch('/api/posts', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			title: postTitle,
			content: editorContent,
			cover: postCover,
			public_visibility: isPublic,
			tags: selectedTags
		})
	});
}
```

#### **Edit Post Page**

```svelte
async function handleSubmit() {
	const response = await fetch('/api/posts', {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			id: post?.id,
			title: postTitle,
			content: editorContent,
			cover: postCover,
			public_visibility: isPublic,
			tags: selectedTags
		})
	});
}
```

## Benefits

### **Improved Reliability**

- **Better Error Handling**: Proper error responses and user feedback
- **Tag Loading**: Tags are now properly loaded and displayed
- **Consistent State**: No more form submission issues
- **Reactive Tags**: New tags are immediately available in the MultiTagSelect component

### **Better User Experience**

- **Real-time Feedback**: Toast notifications for all actions
- **No Page Reloads**: Smooth, SPA-like experience
- **Immediate Validation**: Client-side validation with instant feedback
- **Dynamic Tag Creation**: New tags appear immediately in the dropdown

### **Cleaner Architecture**

- **Separation of Concerns**: Server handles data, client handles UI
- **Reusable API**: API endpoints can be used by other parts of the app
- **Better Testing**: Easier to test individual components
- **Reactive Stores**: Centralized state management for tags

### **Code Quality**

- **Reduced Duplication**: Shared utility functions
- **Type Safety**: Full TypeScript support
- **Maintainability**: Easier to modify and extend
- **Svelte Best Practices**: Uses reactive stores for state management

## Migration Notes

The refactoring:

- **Preserves all functionality** while improving reliability
- **Uses existing utility functions** for tag operations
- **Maintains backward compatibility** with existing data
- **Improves tag loading** and display issues
- **Provides better error handling** and user feedback
- **Implements reactive tag management** for dynamic tag creation

## Tag Loading Fix

The main issue with tags not displaying has been resolved by:

1. **Proper Server Loading**: Using utility functions for consistent tag loading
2. **Client-Side State**: Proper state management for tag selection
3. **API Integration**: Reliable tag data through API endpoints
4. **Error Handling**: Graceful fallbacks when tag loading fails
5. **Reactive Store**: New tags are immediately reflected in the UI
