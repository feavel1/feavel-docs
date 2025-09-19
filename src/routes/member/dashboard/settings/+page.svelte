<script lang="ts" module>
	import { z } from 'zod';

	export const settingsSchema = z.object({
		full_name: z
			.string()
			.max(20, { message: 'Full name must be less than 100 characters' })
			.nullable(),
		description: z
			.string()
			.max(100, { message: 'Description must be less than 500 characters' })
			.nullable(),
		birthday: z.string().or(z.literal('')).nullable()
	});

	export type SettingsSchema = typeof settingsSchema;
</script>

<script lang="ts">
	import { invalidate } from '$app/navigation';
	import AvatarUpload from '$lib/components/modules/user/AvatarUpload.svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { LogOut, User, Shield } from '@lucide/svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form';
	import { toast } from 'svelte-sonner';

	// Extract data from props
	const { data } = $props();
	const { userProfile, session, supabase, form: formData } = data;

	// Initialize form with proper binding and submission handling
	const form = superForm(formData, {
		validators: zodClient(settingsSchema),
		resetForm: false, // Don't reset form after submission
		onSubmit: () => {
			submitting = true;
		},
		onResult: ({ result }) => {
			submitting = false;
			// Don't update form values with server data on success
			if (result.type === 'success') {
				// Just show the success message, keep current form values
				return;
			}
		},
		onError: () => {
			submitting = false;
		}
	});

	// Form state
	const { form: formValues, enhance } = form;
	let submitting = $state(false);

	// Derive form message and errors
	let message = $derived(form.message);
	let errors = $derived(form.errors ?? {});

	// Show toast when message changes
	$effect(() => {
		if ($message) {
			toast.success($message);
		}
	});

	// Focus on first error
	$effect(() => {
		if (Object.keys(errors).length) {
			requestAnimationFrame(() => {
				document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
			});
		}
	});
</script>

<div class="space-y-6">
	<form method="POST" class="space-y-6" use:enhance>
		<Card>
			<CardHeader>
				<CardTitle>Profile Information</CardTitle>
				<CardDescription>Update your personal information</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<Form.Field {form} name="full_name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Full Name</Form.Label>
							<Input
								{...props}
								bind:value={$formValues.full_name}
								placeholder="Enter your full name"
							/>
						{/snippet}
					</Form.Control>
					<Form.Description>Enter your full name</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="description">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Bio</Form.Label>
							<Textarea
								{...props}
								bind:value={$formValues.description}
								placeholder="Tell us about yourself"
								rows={4}
							/>
						{/snippet}
					</Form.Control>
					<Form.Description>Tell us about yourself</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="birthday">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Birthday</Form.Label>
							<Input {...props} bind:value={$formValues.birthday} type="date" />
						{/snippet}
					</Form.Control>
					<Form.Description>Your birthday</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<div class="flex justify-end">
					<Form.Button disabled={submitting}>
						{#if submitting}
							Saving...
						{:else}
							Save Changes
						{/if}
					</Form.Button>
				</div>
			</CardContent>
		</Card>
	</form>

	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<User class="h-5 w-5" />
				Profile Picture
			</CardTitle>
			<CardDescription>Update your profile picture</CardDescription>
		</CardHeader>
		<CardContent>
			<AvatarUpload
				{supabase}
				userId={session.user.id}
				username={userProfile?.username}
				currentAvatarUrl={userProfile?.avatar_url}
				on:avatarUpdated={() => invalidate('app:user')}
			/>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<Shield class="h-5 w-5" />
				Account Security
			</CardTitle>
			<CardDescription>Manage your account security settings</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="flex flex-col gap-3">
				<Button variant="outline" onclick={() => (window.location.href = '/auth/logout')}>
					<LogOut class="mr-2 h-4 w-4" />
					Logout
				</Button>
				<Button variant="destructive" disabled>
					<Shield class="mr-2 h-4 w-4" />
					Delete Account
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
