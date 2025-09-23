import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ parent }) => {
	const { session } = await parent();

	return {
		session
	};
};
