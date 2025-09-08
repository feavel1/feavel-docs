import type { SupabaseClient } from '@supabase/supabase-js';

export interface UserProfile {
	id: string;
	username: string;
	full_name?: string;
	avatar_url?: string;
	birthday?: string;
	description?: string;
}

const USER_FIELDS = 'id, username, full_name, avatar_url, birthday, description';

export async function getUserProfile(
	supabase: SupabaseClient,
	userId: string
): Promise<UserProfile | null> {
	const { data, error } = await supabase
		.from('users')
		.select(USER_FIELDS)
		.eq('id', userId)
		.single();

	return error || !data ? null : data;
}

export async function getUserProfileByUsername(
	supabase: SupabaseClient,
	username: string
): Promise<UserProfile | null> {
	const { data, error } = await supabase
		.from('users')
		.select(USER_FIELDS)
		.eq('username', username)
		.single();

	return error || !data ? null : data;
}

export async function isUsernameAvailable(
	supabase: SupabaseClient,
	username: string
): Promise<boolean> {
	const { data, error } = await supabase
		.from('users')
		.select('username')
		.eq('username', username)
		.single();

	return !data && !error;
}

export async function getUserStats(
	supabase: SupabaseClient,
	userId: string
): Promise<{ posts: number; comments: number; likes: number }> {
	// Get posts count
	const { count: postsCount } = await supabase
		.from('posts')
		.select('*', { count: 'exact', head: true })
		.eq('user_id', userId)
		.eq('public_visibility', true);

	// Get comments count
	const { count: commentsCount } = await supabase
		.from('post_comments')
		.select('*', { count: 'exact', head: true })
		.eq('user_id', userId)
		.is('is_deleted', false);

	// Get likes received count
	const { count: likesCount } = await supabase
		.from('post_likes')
		.select(
			`
			id,
			posts!inner (
				id,
				user_id,
				public_visibility
			)
		`,
			{ count: 'exact', head: true }
		)
		.eq('posts.user_id', userId)
		.eq('posts.public_visibility', true);

	return {
		posts: postsCount || 0,
		comments: commentsCount || 0,
		likes: likesCount || 0
	};
}

export function getAvatarUrl(
	avatarUrl?: string | null,
	username?: string,
	supabase?: SupabaseClient
): string {
	if (avatarUrl) {
		if (avatarUrl.startsWith('http')) {
			return avatarUrl;
		}

		if (supabase) {
			// Use the new storage utility
			const { data } = supabase.storage.from('storage').getPublicUrl(`avatars/${avatarUrl}`);
			return data.publicUrl;
		}

		return avatarUrl;
	}

	const defaultAvatar = username
		? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`
		: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

	return defaultAvatar;
}
