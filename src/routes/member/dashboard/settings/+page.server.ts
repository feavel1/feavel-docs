import { redirect } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ parent }) => {
	const { session, userProfile } = await parent();

	// Check if user is logged in
	if (!session) {
		throw redirect(303, '/login');
	}

	// For the dashboard, we always use the current user's profile from parent
	return {
		userProfile,
		session
	};
};
