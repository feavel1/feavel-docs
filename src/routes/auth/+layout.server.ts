import type { LayoutServerLoad } from '../$types';
import { redirect } from '@sveltejs/kit';
import { getUserProfile } from '$lib/utils/user';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();

	// If user is already logged in, redirect to their profile
	if (session) {
		const userProfile = await getUserProfile(locals.supabase, session.user.id);

		if (userProfile?.username) {
			throw redirect(303, `/member/${userProfile.username}`);
		} else {
			// Fallback to user ID if username not found
			throw redirect(303, `/member/${session.user.id}`);
		}
	}

	return {};
};
