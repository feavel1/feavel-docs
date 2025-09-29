import { redirect } from '@sveltejs/kit';
import { checkStudioDashboardAccess } from '$lib/utils/studio';

export const load = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	if (!session) {
		redirect(303, '/auth/login');
	}

	// Check if user has access to studio dashboard
	const { hasAccess, isApproved, studio } = await checkStudioDashboardAccess(
		supabase,
		session.user.id
	);

	if (!hasAccess) {
		// Redirect to member dashboard if user is not a studio
		redirect(303, '/member/dashboard');
	}

	return {
		studio,
		isApproved
	};
};
