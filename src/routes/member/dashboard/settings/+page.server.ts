import { error, redirect } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';
import { getUserProfileByUsername } from '$lib/utils/user';

export const load: ServerLoad = async ({ params, locals }) => {
	const { session } = await locals.safeGetSession();

	// If not logged in, redirect to login
	if (!session) {
		throw redirect(303, '/auth/login');
	}

	const slug = params.slug as string;

	// Fetch user by username
	const userProfile = await getUserProfileByUsername(locals.supabase, slug);

	if (!userProfile) {
		throw error(404, 'User not found');
	}

	// Check if this is the current user's profile
	const isOwnProfile = session.user.id === userProfile.id;

	if (!isOwnProfile) {
		throw error(403, 'You can only edit your own profile');
	}

	return {
		userProfile,
		session
	};
};
