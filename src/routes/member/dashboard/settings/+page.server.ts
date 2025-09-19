import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { updateUserProfile } from '$lib/utils/user';
import { settingsSchema } from './+page.svelte';

export const load: PageServerLoad = async ({ parent }) => {
	const { session, userProfile } = await parent();

	// Check if user is logged in
	if (!session) {
		throw redirect(303, '/auth/login');
	}

	// Initialize form with user profile data
	const formData = {
		full_name: userProfile?.full_name ?? null,
		description: userProfile?.description ?? null,
		birthday: userProfile?.birthday ?? null
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

		// Update user profile
		const result = await updateUserProfile(locals.supabase, session.user.id, {
			full_name: form.data.full_name ?? null,
			description: form.data.description ?? null,
			birthday: form.data.birthday ?? null
		});

		if (!result.success) {
			return message(form, { type: 'error', text: 'Failed to update profile' }, { status: 500 });
		}

		// Return success message
		return message(form, { type: 'success', text: 'Profile updated successfully!' });
	}
};
