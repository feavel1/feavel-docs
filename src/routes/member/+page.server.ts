import type { ServerLoad } from '@sveltejs/kit';
import { getUserStats } from '$lib/utils/user';

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

	// Fetch stats for each user
	const userProfilesWithStats = userProfiles ? await Promise.all(
		userProfiles.map(async (user) => {
			const stats = await getUserStats(locals.supabase, user.id);
			return {
				...user,
				stats
			};
		})
	) : [];

	return {
		userProfilesWithStats,
		session
	};
};
