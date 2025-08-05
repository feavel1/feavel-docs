// src/routes/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
	const { session } = await safeGetSession();

	return {
		session
	};
};

export const actions: Actions = {
	async default() {
		try {
			// Process form data here
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Internal server error' });
		}
	}
};
