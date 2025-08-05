import type { SupabaseClient } from '@supabase/supabase-js';
import type { PostLike } from '$lib/types/comments';

export async function getLikeCount(
	supabase: SupabaseClient,
	postId: string | number
): Promise<number> {
	const numericPostId = typeof postId === 'string' ? parseInt(postId, 10) : postId;
	if (numericPostId <= 0 || isNaN(numericPostId)) return 0;

	const { count, error } = await supabase
		.from('post_likes')
		.select('*', { count: 'exact', head: true })
		.eq('post_id', numericPostId);

	if (error) {
		console.error('Error fetching like count:', error);
		return 0;
	}

	return count || 0;
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
