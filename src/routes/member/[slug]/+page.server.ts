import { error, redirect } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';
import { getUserProfileByUsername } from '$lib/utils/user';

export const load: ServerLoad = async ({ params, locals }) => {
	const { session } = await locals.safeGetSession();

	const slug = params.slug as string;

	// Fetch user by username
	const userProfile = await getUserProfileByUsername(locals.supabase, slug);

	if (!userProfile) {
		throw error(404, 'User not found');
	}

	// Check if this is the current user's profile (only if logged in)
	const isOwnProfile = session?.user?.id === userProfile.id;

	return {
		userProfile,
		isOwnProfile,
		session
	};
};
