import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { session } = await parent();

	if (!session) {
		return {
			redirect: '/auth/signin'
		};
	}

	return {
		session
	};
};
