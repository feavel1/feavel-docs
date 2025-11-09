# Data Model for Remote Functions

## Overview

This document defines the data models for the remote functions that will be created to simplify data fetching patterns in the Feavel Docs application. The focus is on maximizing Supabase's selective single fetch joins to minimize JavaScript mapping operations. Not all data should be coupled in a single fetch - pagination-aware data like post comments should be handled separately to maintain proper pagination functionality.

## Posts System

### Post Entity

The Post entity leverages Supabase's selective joins to fetch core related data in a single query. Pagination-aware data like comments are handled separately to maintain proper pagination functionality:

```typescript
interface Post {
	id: number;
	user_id: string;
	title: string | null;
	content_v2: any;
	cover_file_id: string | null;
	public_visibility: boolean;
	post_views: number;
	created_at: string;
	updated_at: string;
	// Joined data from users table
	users?: {
		username: string | null;
		avatar_file_id: string | null;
	} | null;
	// Joined data from posts_tags_rel and posts_tags tables
	posts_tags_rel?:
		| {
				posts_tags: {
					id: number;
					tag_name: string;
				} | null;
		  }[]
		| null;
	// Joined data from posts_likes and users tables
	posts_likes?:
		| {
				id: number;
				user_id: string;
				created_at: string;
				users?: {
					username: string | null;
					avatar_file_id: string | null;
				} | null;
		  }[]
		| null;
	// Note: posts_comments are NOT included in the join as they require pagination
	// Comments will be fetched separately with dedicated remote functions
}
```

### Tag Entity

```typescript
interface Tag {
	id: number;
	tag_name: string;
}
```

### Remote Functions

Remote functions are designed to leverage Supabase's selective joins to minimize JavaScript processing. Pagination-aware data is handled separately. Function names follow clear, descriptive naming conventions:

1. `getDrafts(userId: string): Promise<Post[]>` - Fetch user's draft posts with related data (no comments)
2. `getPopularTags(): Promise<Tag[]>` - Fetch most frequently used tags
3. `getPostsByTag(tagName: string): Promise<Post[]>` - Fetch posts by tag with related data (no comments)
4. `getPost(postId: number): Promise<Post | null>` - Fetch a single post with related data (no comments)
5. `getPublicPosts(options?: { limit?: number, offset?: number }): Promise<Post[]>` - Fetch public posts with related data (no comments)
6. `getPostComments(postId: number, options?: { limit?: number, offset?: number }): Promise<Comment[]>` - Fetch paginated comments for a post

## Services System

### Service Entity

The Service entity uses Supabase joins to fetch all related data in one query:

```typescript
interface Service {
	id: string;
	created_by: string;
	name: string;
	description: string;
	price: number;
	type: string;
	enabled: boolean;
	created_at: string;
	updated_at: string;
	// Joined data from studios table
	studios?: {
		name: string | null;
		description: string | null;
		contact_phone: string | null;
	} | null;
	// Joined data from services_category_rel and services_category tables
	services_category_rel?:
		| {
				services_category: {
					category_name: string;
				} | null;
		  }[]
		| null;
	// Joined data from service_downloads table
	service_downloads?:
		| {
				preview_file_id: string | null;
				product_file_id: string | null;
		  }[]
		| null;
}
```

### Category Entity

```typescript
interface Category {
	id: number;
	category_name: string;
}
```

### Remote Functions

Remote functions leverage Supabase joins for efficient data fetching. Function names follow clear, descriptive naming conventions:

1. `getServiceCategories(): Promise<Category[]>` - Fetch all service categories with related data
2. `getService(serviceId: string): Promise<Service | null>` - Fetch a service with all related data
3. `checkServiceAccess(serviceId: string, userId: string): Promise<boolean>` - Check if user has access to a service
4. `getServiceFiles(serviceId: string): Promise<Service | null>` - Fetch service with file download information

## Chat System

### Conversation Entity

The Conversation entity uses Supabase joins to fetch all related data efficiently:

```typescript
interface ChatConversation {
	id: string;
	created_at: string;
	// Joined data from chat_participants table
	chat_participants?:
		| {
				user_id: string;
		  }[]
		| null;
	// Joined data from chat_groups table
	chat_groups?: {
		name: string | null;
		description: string | null;
		is_public: boolean | null;
	} | null;
}
```

### Message Entity

```typescript
interface ChatMessage {
	id: string;
	conversation_id: string;
	message: string;
	sent_from: string;
	created_at: string;
	updated_at: string;
}
```

### Group Entity

```typescript
interface ChatGroup {
	id: string;
	conversation_id: string;
	name: string;
	description: string | null;
	created_by: string;
	is_public: boolean;
	created_at: string;
	updated_at: string;
}
```

### Remote Functions

Remote functions are designed to minimize JavaScript processing by using Supabase joins. Function names follow clear, descriptive naming conventions:

1. `getUserConversations(userId: string): Promise<ChatConversation[]>` - Fetch user's conversations with related data
2. `getConversationMessages(conversationId: string, options?: { limit?: number, before?: string }): Promise<ChatMessage[]>` - Fetch messages for a conversation
3. `sendMessage(data: { conversation_id: string, message: string, sent_from: string }): Promise<ChatMessage | null>` - Send a message to a conversation
4. `createGroupChat(data: { name: string, description: string, created_by: string, is_public: boolean, participantIds: string[] }): Promise<{ conversation: ChatConversation, group: ChatGroup } | null>` - Create a new group chat
5. `joinGroupChat(conversationId: string, userId: string): Promise<boolean>` - Add user to a group chat
6. `getGroupInfo(conversationId: string): Promise<ChatGroup | null>` - Fetch group information
7. `getPublicGroups(): Promise<(ChatGroup & { conversation: ChatConversation })[]>` - Fetch all public group chats with related data

## General Utility Functions

### Remote Functions

Utility functions that focus on common operations rather than complex processing. Function names follow clear, descriptive naming conventions:

1. `validateInput(value: any, schema: any): Promise<boolean>` - Validate input data against a schema
2. `paginateResults<T>(data: T[], page: number, limit: number): Promise<T[]>` - Paginate an array of results
3. `handleDatabaseError(error: any): Promise<{ success: boolean, error?: string }>` - Handle and format database errors
