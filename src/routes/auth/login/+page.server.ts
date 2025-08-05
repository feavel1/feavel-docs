import type { PageServerLoad, Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { fail } from '@sveltejs/kit';
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
			locals: { supabase }
		} = event;
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, { form });
		}
		const { email, password } = form.data;
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) {
			form.errors = { email: [error.message] };
			return fail(400, { form });
		}
		// const user = data?.user;

		// if (user) {
		// 	throw redirect(303, `/member/${user.username}`);
		// }
		return { form };
	}
};
