import type { SupabaseClient } from '@supabase/supabase-js';
import type { PostLike } from '$lib/types/comments';

export async function getLikeCount(supabase: SupabaseClient, postId: number): Promise<number> {
	if (postId <= 0) return 0;

	const { count, error } = await supabase
		.from('post_likes')
		.select('*', { count: 'exact', head: true })
		.eq('post_id', postId);

	if (error) {
		console.error('Error fetching like count:', error);
		return 0;
	}

	return count || 0;
}

export async function isPostLiked(
	supabase: SupabaseClient,
	postId: number,
	userId: string
): Promise<boolean> {
	if (postId <= 0 || !userId) return false;

	const { data, error } = await supabase
		.from('post_likes')
		.select('id')
		.eq('post_id', postId)
		.eq('user_id', userId)
		.single();

	return !error && !!data;
}

export async function toggleLike(
	supabase: SupabaseClient,
	postId: number,
	userId: string
): Promise<{ success: boolean; isLiked: boolean }> {
	if (postId <= 0 || !userId) {
		return { success: false, isLiked: false };
	}

	const isLiked = await isPostLiked(supabase, postId, userId);

	if (isLiked) {
		// Unlike
		const { error } = await supabase
			.from('post_likes')
			.delete()
			.eq('post_id', postId)
			.eq('user_id', userId);

		if (error) {
			console.error('Error unliking post:', error);
			return { success: false, isLiked: true };
		}

		return { success: true, isLiked: false };
	} else {
		// Like
		const { error } = await supabase.from('post_likes').insert({
			post_id: postId,
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
	postId: number,
	limit: number = 10
): Promise<PostLike[]> {
	if (postId <= 0 || limit < 1) return [];

	const { data, error } = await supabase
		.from('post_likes')
		.select(
			`
			*,
			users!inner(username, avatar_url)
		`
		)
		.eq('post_id', postId)
		.order('created_at', { ascending: false })
		.limit(limit);

	if (error) {
		console.error('Error fetching liked users:', error);
		return [];
	}

	return data;
}
