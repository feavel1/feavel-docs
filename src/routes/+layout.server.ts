// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { getUserProfileWithStudio } from '$lib/utils/user';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase }, cookies }) => {
	const { session, user } = await safeGetSession();

	// If user is logged in, fetch their profile with studio information
	let userProfile = null;
	if (session?.user) {
		userProfile = await getUserProfileWithStudio(supabase, session.user.id);
	}

	return {
		session,
		user,
		userProfile,
		cookies: cookies.getAll()
	};
};
