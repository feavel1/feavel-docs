import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { hasUserAppliedToStudio, createStudioApplication } from '$lib/utils/studio';
import { studioApplicationSchema } from './+page.svelte';

export const load = async ({ locals: { supabase }, parent }) => {
	const { session } = await parent();

	if (!session) {
		redirect(303, '/auth/login');
	}

	try {
		// Check if user has already applied
		const hasApplied = await hasUserAppliedToStudio(supabase, session.user.id);
		if (hasApplied) {
			// Redirect to dashboard if already applied
			redirect(303, '/studio/dashboard');
		}
	} catch (error) {
		console.error('Error checking application status:', error);
		// Continue with form initialization even if we can't check application status
	}

	// Initialize form with empty values
	const form = await superValidate(zod(studioApplicationSchema));

	return {
		form,
		session
	};
};

export const actions: Actions = {
	default: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();

		if (!session) {
			redirect(303, '/auth/login');
		}

		try {
			// Check if user has already applied
			const hasApplied = await hasUserAppliedToStudio(supabase, session.user.id);
			if (hasApplied) {
				return fail(409, {
					error: 'You have already applied to become a studio'
				});
			}
		} catch (error) {
			console.error('Error checking application status:', error);
			return fail(500, {
				error: 'Failed to check application status. Please try again later.'
			});
		}

		// Validate form
		const form = await superValidate(request, zod(studioApplicationSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// Create studio application
			await createStudioApplication(supabase, session.user.id, form.data);

			return {
				form,
				success: true
			};
		} catch (error) {
			console.error('Error creating studio application:', error);
			return fail(500, {
				form,
				error: error instanceof Error ? error.message : 'Failed to submit studio application'
			});
		}
	}
};
