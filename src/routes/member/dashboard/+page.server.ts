import { error, redirect } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';
import { getUserProfileByUsername } from '$lib/utils/user';

export const load: ServerLoad = async ({ params, locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) {
		throw redirect(303, '/login');
	}

	const username = params.username;
	if (!username) {
		throw error(400, 'Username is required');
	}

	const { data: userProfile, error: profileError } = await getUserProfileByUsername(
		locals.supabase,
		username
	);

	if (profileError) {
		console.error('Error fetching user profile:', profileError);
		throw error(500, 'Failed to load user profile');
	}

	if (!userProfile) {
		throw error(404, 'User profile not found');
	}

	return {
		userProfile,
		session
	};
};
