import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { updateUserProfile } from '$lib/utils/user';
import { settingsSchema } from './+page.svelte';

export const load: PageServerLoad = async ({ parent }) => {
	const { session, userProfile } = await parent();

	// Check if user is logged in
	if (!session) {
		throw redirect(303, '/auth/login');
	}

	// Create form with existing user data
	const formData = {
		full_name: userProfile?.full_name || '',
		description: userProfile?.description || '',
		birthday: userProfile?.birthday || ''
	};

	return {
		userProfile,
		session,
		form: await superValidate(formData, zod(settingsSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const { locals } = event;
		const { session } = await locals.safeGetSession();
		const form = await superValidate(event, zod(settingsSchema));

		// Check if user is logged in
		if (!session) {
			throw redirect(303, '/auth/login');
		}

		// Check if form is valid
		if (!form.valid) {
			return fail(400, { form });
		}
		console.log('Form data:', form.data);

		// Update user profile
		const result = await updateUserProfile(locals.supabase, session.user.id, {
			full_name: form.data.full_name ?? null,
			description: form.data.description ?? null,
			birthday: form.data.birthday ?? null
		});

		if (!result.success) {
			return fail(500, { form });
		}

		// Reload the form with updated data to prevent UI from reverting
		const updatedFormData = {
			full_name: form.data.full_name && form.data.full_name !== '' ? form.data.full_name : null,
			description: form.data.description && form.data.description !== '' ? form.data.description : null,
			birthday: form.data.birthday && form.data.birthday !== '' ? form.data.birthday : null
		};

		// Re-validate the form with updated data
		const updatedForm = await superValidate(updatedFormData, zod(settingsSchema));

		// Return success with updated form data
		return { form: updatedForm };
	}
};
