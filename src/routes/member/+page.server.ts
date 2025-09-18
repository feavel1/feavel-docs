import type { ServerLoad } from '@sveltejs/kit';
import { getMultipleUserStats } from '$lib/utils/user';

export const load: ServerLoad = async ({ locals, parent }) => {
	const { session } = await parent();

	// Fetch all public user profiles
	const { data: userProfiles, error } = await locals.supabase
		.from('users')
		.select('id, username, full_name, avatar_url, description')
		.order('username');

	if (error) {
		console.error('Error fetching user profiles:', error);
		return {
			userProfilesWithStats: [],
			session
		};
	}

	// Fetch stats for all users in a single query
	const userIds = userProfiles?.map(user => user.id) || [];
	const userStatsMap = userIds.length > 0
		? await getMultipleUserStats(locals.supabase, userIds)
		: {};

	// Combine user profiles with their stats
	const userProfilesWithStats = userProfiles
		? userProfiles.map(user => ({
				...user,
				stats: userStatsMap[user.id] || { posts: 0, comments: 0, likes: 0 }
			}))
		: [];

	return {
		userProfilesWithStats,
		session
	};
};
