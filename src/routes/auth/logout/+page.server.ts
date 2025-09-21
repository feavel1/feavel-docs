import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.supabase.auth.getUser();
	if (session.data.user) {
		await event.locals.supabase.auth.signOut();
		throw redirect(303, '/auth/login');
	} else {
		throw redirect(303, '/auth/login');
	}
};
