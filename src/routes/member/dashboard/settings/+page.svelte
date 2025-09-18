<script lang="ts" module>
	import { z } from 'zod';

	export const settingsSchema = z.object({
		full_name: z.string().max(100, { message: 'Full name must be less than 100 characters' }).or(z.literal('')).nullable(),
		description: z.string().max(500, { message: 'Description must be less than 500 characters' }).or(z.literal('')).nullable(),
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
	import { zod } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form';
	
	const { data: propsData } = $props();
	const { userProfile, session, supabase } = propsData;

	const form = superForm(propsData.form, {
		validators: zod(settingsSchema),
		onResult: ({ result }) => {
			if (result.type === 'success') {
				console.log('Profile updated successfully!');
			} else if (result.type === 'failure') {
				console.log('Failed to update profile. Please try again.');
			}
		}
	});
	const { form: formValues, enhance } = form;
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
					<Form.Button>Save Changes</Form.Button>
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
