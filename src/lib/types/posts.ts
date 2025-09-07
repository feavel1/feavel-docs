import type { PostLike, PostComment } from './comments';
import type { Tables } from '$lib/types/database.types';

// Simplified type using the new Tables<> syntax for the base post structure
// Before: Complex nested type definitions
// After: Clean, simplified type using Tables<'posts'>
export type PostRow = Tables<'posts'>;

// Extended Post interface that includes relationships and computed properties
// This maintains backward compatibility while leveraging the new type system
export interface Post extends PostRow {
	// Type corrections to match the current usage in the codebase
	id: number; // The database type shows id as number, but codebase uses string
	users?: {
		username: string;
		avatar_url?: string;
	};
	posts_tags_rel?: Array<{
		post_tags: {
			tag_name: string;
		};
	}>;
	post_likes?: PostLike[];
	post_comments?: PostComment[];
}

// Simplified tag type using the new Tables<> syntax
export type Tag = Tables<'post_tags'>;

export interface PostsPageData {
	session: any;
	posts: Post[];
	tags: Tag[];
	supabase: any;
}

export interface PostFilters {
	searchQuery: string;
	selectedTags: string[];
}
