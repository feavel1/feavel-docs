import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ parent, locals }) => {
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
	let services: any[] = [];

	// If approved, fetch studio services
	if (isApproved) {
		const { data, error } = await locals.supabase
			.from('services_v2')
			.select(
				`
				id,
				name,
				price,
				cover_url,
				highlights,
				service_type,
				status,
				created_at,
				created_by,
				studios!services_v2_created_by_fkey(name),
				services_category_rel(
					services_category!inner(category_name)
				)
			`
			)
			.eq('created_by', userProfile.studio.id)
			.order('created_at', { ascending: false });

		if (!error) {
			services = data || [];
		}
	}

	return {
		studio: userProfile.studio,
		isApproved,
		services
	};
};
