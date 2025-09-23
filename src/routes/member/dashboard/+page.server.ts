import { redirect, type ServerLoad } from '@sveltejs/kit';
import { getUserStats } from '$lib/utils/user';

export const load: ServerLoad = async ({ locals: { supabase }, parent }) => {
	const { session, userProfile } = await parent();

	if (!session) {
		redirect(301, '/auth/login');
	}

	const stats = await getUserStats(supabase, session.user.id);

	return {
		userProfile,
		stats,
		session
	};
};
