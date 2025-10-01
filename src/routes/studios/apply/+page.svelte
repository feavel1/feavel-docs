<script lang="ts" module>
	import { z } from 'zod';

	export const studioApplicationSchema = z.object({
		name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
		description: z
			.string()
			.min(1, 'Description is required')
			.max(500, 'Description must be 500 characters or less'),
		contact_phone: z
			.number({ invalid_type_error: 'Contact phone must be a number' })
			.positive('Contact phone must be a positive number'),
		salary_expectation: z
			.string()
			.min(1, 'Salary expectation is required')
			.max(100, 'Salary expectation must be 100 characters or less')
	});
</script>

<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { redirect } from '@sveltejs/kit';
	import { toast } from 'svelte-sonner';

	// Get data from parent layout
	const { data } = $props();
	const { form } = data;

	// Initialize form with superForm
	const {
		form: formValues,
		enhance,
		submitting,
		errors
	} = superForm(form, {
		validators: zodClient(studioApplicationSchema),
		resetForm: false,
		onResult: ({ result }) => {
			// Focus on first error
			if (errors && Object.keys(errors).length) {
				requestAnimationFrame(() => {
					document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
				});
			}
			// Show success message
			else if (result.type === 'success' && result.data?.success) {
				toast.success('Studio application submitted successfully!');
				// Redirect to dashboard after successful submission
				redirect(303, '/studios/dashboard');
			}
			// Show error message
			else if (result.type === 'failure' && result.data?.error) {
				toast.error(result.data.error);
			}
		}
	});
</script>

{#if $formValues}
	<div class="mx-auto max-w-2xl py-8">
		<h1 class="mb-6 text-2xl font-bold">Apply to Become a Studio</h1>

		<form method="POST" use:enhance>
			<div class="mb-4">
				<label for="name" class="mb-2 block text-sm font-medium">Studio Name</label>
				<input
					id="name"
					name="name"
					bind:value={$formValues.name}
					aria-invalid={$errors?.name ? 'true' : 'false'}
					aria-describedby="name-error"
					class="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
				{#if $errors?.name}
					<p id="name-error" class="mt-1 text-sm text-red-600" role="alert">
						{$errors.name}
					</p>
				{/if}
			</div>

			<div class="mb-4">
				<label for="description" class="mb-2 block text-sm font-medium">Description</label>
				<textarea
					id="description"
					name="description"
					bind:value={$formValues.description}
					rows="4"
					aria-invalid={$errors?.description ? 'true' : 'false'}
					aria-describedby="description-error"
					class="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				></textarea>
				{#if $errors?.description}
					<p id="description-error" class="mt-1 text-sm text-red-600" role="alert">
						{$errors.description}
					</p>
				{/if}
			</div>

			<div class="mb-4">
				<label for="contact_phone" class="mb-2 block text-sm font-medium">Contact Phone</label>
				<input
					type="number"
					id="contact_phone"
					name="contact_phone"
					bind:value={$formValues.contact_phone}
					aria-invalid={$errors?.contact_phone ? 'true' : 'false'}
					aria-describedby="contact_phone-error"
					class="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
				{#if $errors?.contact_phone}
					<p id="contact_phone-error" class="mt-1 text-sm text-red-600" role="alert">
						{$errors.contact_phone}
					</p>
				{/if}
			</div>

			<div class="mb-6">
				<label for="salary_expectation" class="mb-2 block text-sm font-medium">
					Salary Expectation
				</label>
				<input
					id="salary_expectation"
					name="salary_expectation"
					bind:value={$formValues.salary_expectation}
					aria-invalid={$errors?.salary_expectation ? 'true' : 'false'}
					aria-describedby="salary_expectation-error"
					class="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
				{#if $errors?.salary_expectation}
					<p id="salary_expectation-error" class="mt-1 text-sm text-red-600" role="alert">
						{$errors.salary_expectation}
					</p>
				{/if}
			</div>

			<div class="flex items-center justify-between">
				<button
					type="submit"
					disabled={$submitting}
					class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
				>
					{#if $submitting}
						Submitting...
					{:else}
						Submit Application
					{/if}
				</button>
			</div>
		</form>
	</div>
{:else}
	<div class="py-8 text-center">
		<p>Loading form...</p>
	</div>
{/if}
