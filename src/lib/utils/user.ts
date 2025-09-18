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

/**
 * Fetch user stats for multiple users in a single query
 * This is more efficient than calling getUserStats for each user individually
 */
export async function getMultipleUserStats(
	supabase: SupabaseClient,
	userIds: string[]
): Promise<Record<string, { posts: number; comments: number; likes: number }>> {
	if (userIds.length === 0) {
		return {};
	}

	// Create a map to store the results
	const statsMap: Record<string, { posts: number; comments: number; likes: number }> = {};

	// Initialize all users with zero stats
	userIds.forEach((userId) => {
		statsMap[userId] = { posts: 0, comments: 0, likes: 0 };
	});

	// Get posts count for all users in a single query
	const { data: postsData, error: postsError } = await supabase
		.from('posts')
		.select('user_id, id')
		.in('user_id', userIds)
		.eq('public_visibility', true);

	if (!postsError && postsData) {
		// Count posts per user
		const postsCount: Record<string, number> = {};
		postsData.forEach((post) => {
			postsCount[post.user_id] = (postsCount[post.user_id] || 0) + 1;
		});

		// Update stats map with post counts
		Object.keys(postsCount).forEach((userId) => {
			if (statsMap[userId]) {
				statsMap[userId].posts = postsCount[userId];
			}
		});
	}

	// Get comments count for all users in a single query
	const { data: commentsData, error: commentsError } = await supabase
		.from('post_comments')
		.select('user_id, id')
		.in('user_id', userIds)
		.is('is_deleted', false);

	if (!commentsError && commentsData) {
		// Count comments per user
		const commentsCount: Record<string, number> = {};
		commentsData.forEach((comment) => {
			commentsCount[comment.user_id] = (commentsCount[comment.user_id] || 0) + 1;
		});

		// Update stats map with comment counts
		Object.keys(commentsCount).forEach((userId) => {
			if (statsMap[userId]) {
				statsMap[userId].comments = commentsCount[userId];
			}
		});
	}

	// Get likes count for all users - this is more complex as we need to count likes on user's posts
	// First get all posts by these users
	const { data: userPosts, error: userPostsError } = await supabase
		.from('posts')
		.select('id, user_id')
		.in('user_id', userIds)
		.eq('public_visibility', true);

	if (!userPostsError && userPosts && userPosts.length > 0) {
		const postIds = userPosts.map((post) => post.id);
		const postToUserMap: Record<string, string> = {};
		userPosts.forEach((post) => {
			postToUserMap[post.id] = post.user_id;
		});

		// Then count likes on those posts
		if (postIds.length > 0) {
			const { data: likesData, error: likesError } = await supabase
				.from('post_likes')
				.select('post_id')
				.in('post_id', postIds);

			if (!likesError && likesData) {
				// Group likes by post owner
				const likesCount: Record<string, number> = {};
				likesData.forEach((like) => {
					const userId = postToUserMap[like.post_id];
					if (userId) {
						likesCount[userId] = (likesCount[userId] || 0) + 1;
					}
				});

				// Update stats map with like counts
				Object.keys(likesCount).forEach((userId) => {
					if (statsMap[userId]) {
						statsMap[userId].likes = likesCount[userId];
					}
				});
			}
		}
	}

	return statsMap;
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
