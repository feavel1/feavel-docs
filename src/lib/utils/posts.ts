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
