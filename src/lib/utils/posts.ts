import type { Post, PostFilters } from '$lib/types/posts';

export function filterPosts(posts: Post[], filters: PostFilters): Post[] {
	let filtered = posts;

	// Filter by tags
	if (filters.selectedTags.length > 0) {
		filtered = filtered.filter((post) =>
			post.posts_tags_rel?.some((rel) => filters.selectedTags.includes(rel.post_tags.tag_name))
		);
	}

	// Filter by search query
	if (filters.searchQuery) {
		const query = filters.searchQuery.toLowerCase();
		filtered = filtered.filter(
			(post) =>
				post.title?.toLowerCase().includes(query) ||
				post.users?.username?.toLowerCase().includes(query)
		);
	}

	return filtered;
}

export function getPostTags(post: Post): string[] {
	return post.posts_tags_rel?.map((rel) => rel.post_tags.tag_name) || [];
}

export function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString();
}

export function getPostViews(post: Post): number {
	return post.post_views || 0;
}

export function isPostOwner(post: Post, userId?: string): boolean {
	return post.user_id === userId;
}

/**
 * Get the number of likes for a post
 * @param post The post object
 * @returns The number of likes
 */
export function getPostLikes(post: Post): number {
	return post.post_likes?.length || 0;
}

/**
 * Get the number of comments for a post
 * @param post The post object
 * @returns The number of comments
 */
export function getPostComments(post: Post): number {
	return post.post_comments?.length || 0;
}

/**
 * Calculate estimated reading time for a post
 * @param content The post content
 * @returns Estimated reading time in minutes
 */
export function getReadingTime(content: string | any): number {
	if (!content) return 1;
	
	// Handle Editor.js content structure
	let text = '';
	if (typeof content === 'object' && content.blocks) {
		text = content.blocks
			.map((block: any) => {
				if (block.type === 'paragraph' && block.data?.text) {
					return block.data.text;
				}
				return '';
			})
			.join(' ');
	} else if (typeof content === 'string') {
		text = content;
	} else {
		return 1;
	}
	
	// Average reading speed: 200 words per minute
	const wordsPerMinute = 200;
	const wordCount = text.trim().split(/\s+/).length;
	return Math.ceil(wordCount / wordsPerMinute) || 1;
}
