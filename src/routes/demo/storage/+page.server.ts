import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();

	return {
		session
	};
};
