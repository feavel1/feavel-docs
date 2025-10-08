import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { updateUserProfile } from '$lib/utils/user';
import { settingsSchema } from './schema';

export const load: PageServerLoad = async ({ parent }) => {
	const { userProfile } = await parent();

	// Initialize form with user profile data
	const formData = {
		full_name: userProfile?.full_name ?? null,
		description: userProfile?.description ?? null,
		birthday: userProfile?.birthday ?? null
	};

	return {
		userProfile,
		form: await superValidate(formData, zod4(settingsSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const { locals } = event;
		const { session } = await locals.safeGetSession();
		const form = await superValidate(event, zod4(settingsSchema));

		// Check if user is logged in
		if (!session) {
			throw redirect(303, '/auth/login');
		}

		// Check if form is valid
		if (!form.valid) {
			return fail(400, { form });
		}

		// Update user profile
		const result = await updateUserProfile(locals.supabase, session.user.id, {
			full_name: form.data.full_name,
			description: form.data.description,
			birthday: form.data.birthday
		});

		if (!result.success) {
			return message(form, { type: 'error', text: 'Failed to update profile' }, { status: 500 });
		}

		// Return success message
		return message(form, { type: 'success', text: 'Profile updated successfully!' });
	}
};
