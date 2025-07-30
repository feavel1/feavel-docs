import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();

	// Fetch all public user profiles
	const { data: userProfiles, error } = await locals.supabase
		.from('users')
		.select('id, username, full_name, avatar_url, description')
		.order('username');

	if (error) {
		console.error('Error fetching user profiles:', error);
		return {
			userProfiles: [],
			session
		};
	}

	return {
		userProfiles: userProfiles || [],
		session
	};
};
