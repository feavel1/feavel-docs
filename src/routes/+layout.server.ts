// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { getUserProfile } from '$lib/utils/user';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase }, cookies }) => {
	const { session, user } = await safeGetSession();

	// If user is logged in, fetch their profile
	let userProfile = null;
	if (session?.user) {
		userProfile = await getUserProfile(supabase, session.user.id);
	}

	return {
		session,
		user,
		userProfile,
		cookies: cookies.getAll()
	};
};
