import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ parent }) => {
	const { userProfile } = await parent();

	// Check if user has access to studio dashboard
	// Users with 'applied' or 'approved' status have access
	if (
		!userProfile?.studio ||
		(userProfile.studio.status !== 'applied' && userProfile.studio.status !== 'approved')
	) {
		// Redirect to member dashboard if user is not a studio
		redirect(303, '/member/dashboard');
	}

	const isApproved = userProfile.studio.status === 'approved';

	return {
		studio: userProfile.studio,
		isApproved
	};
};
