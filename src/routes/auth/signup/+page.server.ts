import type { PageServerLoad, Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { fail, redirect } from '@sveltejs/kit';
import { formSchema } from './schema';
import { zod } from 'sveltekit-superforms/adapters';
import { isUsernameAvailable } from '$lib/utils/user';

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

		const { email, password, username } = form.data;

		// Check if username is already taken
		const usernameAvailable = await isUsernameAvailable(supabase, username);

		if (!usernameAvailable) {
			form.errors = { username: ['Username is already taken'] };
			return fail(400, { form });
		}

		// Create user account with username in metadata
		const { data: authData, error: signUpError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					username: username,
					full_name: username // Default to username, user can change later
				}
			}
		});

		if (signUpError) {
			form.errors = { email: [signUpError.message] };
			return fail(400, { form });
		}

		// The handle_new_user function will automatically create the user record
		// when the user confirms their email

		// Redirect to login page
		throw redirect(
			303,
			'/auth/login?message=Account created successfully. Please check your email to verify your account.'
		);
	}
};
