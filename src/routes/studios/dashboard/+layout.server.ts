import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
	const { userStudio } = await parent();

	// Check if user has access to studio dashboard
	// Users with 'applied' or 'approved' status have access
	if (!userStudio || (userStudio.status !== 'applied' && userStudio.status !== 'approved')) {
		// Redirect to member dashboard if user is not a studio
		redirect(303, '/member/dashboard');
	}

	const isApproved = userStudio.status === 'approved';

	return {
		studio: userStudio,
		isApproved
	};
};
