import type { PageServerLoad, Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { fail, redirect } from '@sveltejs/kit';
import { formSchema } from './schema';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(formSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const {
			request,
			locals: { supabase }
		} = event;
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, { form });
		}
		const { email, password } = form.data;
		const { error } = await supabase.auth.signUp({ email, password });
		if (error) {
			form.errors = { email: [error.message] };
			return fail(400, { form });
		}
		// Optionally, redirect or show a message
		// throw redirect(303, '/auth/login');
		return { form, success: true };
	}
};
