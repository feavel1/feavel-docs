import type { SupabaseClient } from '@supabase/supabase-js';
import type { Tables } from '$lib/types/database.types';

type PostLike = Tables<'post_likes'> & {
	users: {
		username: string;
		avatar_url: string | null;
	};
};

// Simple in-memory cache for like counts with improved management
class LikeCountCache {
	private cache = new Map<string, { count: number; timestamp: number }>();
	private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

	get(postId: number): number | null {
		const cacheKey = `post_${postId}`;
		const cached = this.cache.get(cacheKey);

		if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
			return cached.count;
		}

		// Remove expired cache entry
		if (cached) {
			this.cache.delete(cacheKey);
		}

		return null;
	}

	set(postId: number, count: number): void {
		const cacheKey = `post_${postId}`;
		this.cache.set(cacheKey, { count, timestamp: Date.now() });
	}

	clear(postId: number): void {
		const cacheKey = `post_${postId}`;
		this.cache.delete(cacheKey);
	}

	// Clear all cache entries (useful for testing or complete reset)
	clearAll(): void {
		this.cache.clear();
	}
}

const likeCountCache = new LikeCountCache();

export async function getLikeCount(
	supabase: SupabaseClient,
	postId: string | number
): Promise<number> {
	const numericPostId = typeof postId === 'string' ? parseInt(postId, 10) : postId;
	if (numericPostId <= 0 || isNaN(numericPostId)) return 0;

	// Check cache first
	const cachedCount = likeCountCache.get(numericPostId);
	if (cachedCount !== null) {
		return cachedCount;
	}

	const { count, error } = await supabase
		.from('post_likes')
		.select('*', { count: 'exact', head: true })
		.eq('post_id', numericPostId);

	if (error) {
		console.error('Error fetching like count:', error);
		return 0;
	}

	const likeCount = count || 0;

	// Cache the result
	likeCountCache.set(numericPostId, likeCount);

	return likeCount;
}

// Clear cache when toggling likes
export function clearLikeCountCache(postId: string | number): void {
	const numericPostId = typeof postId === 'string' ? parseInt(postId, 10) : postId;
	if (numericPostId <= 0 || isNaN(numericPostId)) return;

	likeCountCache.clear(numericPostId);
}

export async function isPostLiked(
	supabase: SupabaseClient,
	postId: string | number,
	userId: string
): Promise<boolean> {
	const numericPostId = typeof postId === 'string' ? parseInt(postId, 10) : postId;
	if (numericPostId <= 0 || isNaN(numericPostId) || !userId) return false;

	const { data, error } = await supabase
		.from('post_likes')
		.select('id')
		.eq('post_id', numericPostId)
		.eq('user_id', userId)
		.maybeSingle();

	return !error && !!data;
}

// Combined function to get both like count and user's like status in one query
export async function getLikeInfo(
	supabase: SupabaseClient,
	postId: string | number,
	userId?: string
): Promise<{ count: number; isLiked: boolean }> {
	const numericPostId = typeof postId === 'string' ? parseInt(postId, 10) : postId;
	if (numericPostId <= 0 || isNaN(numericPostId)) {
		return { count: 0, isLiked: false };
	}

	// Check cache first for like count
	const cachedCount = likeCountCache.get(numericPostId);
	let likeCount = 0;

	if (cachedCount !== null) {
		likeCount = cachedCount;
	} else {
		// Fetch like count from database
		const { count, error } = await supabase
			.from('post_likes')
			.select('*', { count: 'exact', head: true })
			.eq('post_id', numericPostId);

		if (!error) {
			likeCount = count || 0;
			// Update cache
			likeCountCache.set(numericPostId, likeCount);
		}
	}

	// If user is not logged in, they can't have liked the post
	if (!userId) {
		return { count: likeCount, isLiked: false };
	}

	// Check if current user has liked the post
	const { data, error } = await supabase
		.from('post_likes')
		.select('id')
		.eq('post_id', numericPostId)
		.eq('user_id', userId)
		.maybeSingle();

	const isLiked = !error && !!data;

	return { count: likeCount, isLiked };
}

export async function toggleLike(
	supabase: SupabaseClient,
	postId: string | number,
	userId: string
): Promise<{ success: boolean; isLiked: boolean }> {
	const numericPostId = typeof postId === 'string' ? parseInt(postId, 10) : postId;
	if (numericPostId <= 0 || isNaN(numericPostId) || !userId) {
		return { success: false, isLiked: false };
	}

	const isLiked = await isPostLiked(supabase, numericPostId, userId);

	if (isLiked) {
		// Unlike
		const { error } = await supabase
			.from('post_likes')
			.delete()
			.eq('post_id', numericPostId)
			.eq('user_id', userId);

		if (error) {
			console.error('Error unliking post:', error);
			return { success: false, isLiked: true };
		}

		// Clear cache after successful unlike
		clearLikeCountCache(numericPostId);

		return { success: true, isLiked: false };
	} else {
		// Like
		const { error } = await supabase.from('post_likes').insert({
			post_id: numericPostId,
			user_id: userId
		});

		if (error) {
			console.error('Error liking post:', error);
			return { success: false, isLiked: false };
		}

		// Clear cache after successful like
		clearLikeCountCache(numericPostId);

		return { success: true, isLiked: true };
	}
}

export async function getLikedUsers(
	supabase: SupabaseClient,
	postId: string | number,
	limit: number = 10
): Promise<PostLike[]> {
	const numericPostId = typeof postId === 'string' ? parseInt(postId, 10) : postId;
	if (numericPostId <= 0 || isNaN(numericPostId) || limit < 1) return [];

	const { data, error } = await supabase
		.from('post_likes')
		.select(
			`
			*,
			users!inner(username, avatar_url)
		`
		)
		.eq('post_id', numericPostId)
		.order('created_at', { ascending: false })
		.limit(limit);

	if (error) {
		console.error('Error fetching liked users:', error);
		return [];
	}

	return data;
}
