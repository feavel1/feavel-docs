// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { getUserProfile } from '$lib/utils/user';
import { getMostUsedTags } from '$lib/utils/tags';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase }, cookies }) => {
	const { session, user } = await safeGetSession();

	// If user is logged in, fetch their profile
	let userProfile = null;
	if (session?.user) {
		userProfile = await getUserProfile(supabase, session.user.id);
	}

	// Fetch the most used tags for navigation
	const { data: mostUsedTags } = await getMostUsedTags(supabase, 5);

	return {
		session,
		user,
		userProfile,
		mostUsedTags,
		cookies: cookies.getAll()
	};
};
