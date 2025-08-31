<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { superForm, type SuperValidated, type Infer } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { z } from 'zod';

	const {
		formSchema,
		formData,
		title,
		submitText,
		linkText,
		linkHref,
		linkLabel,
		successMessage = ''
	} = $props<{
		formSchema: z.ZodSchema;
		formData: SuperValidated<Infer<typeof formSchema>>;
		title: string;
		submitText: string;
		linkText: string;
		linkHref: string;
		linkLabel: string;
		successMessage?: string;
	}>();

	const form = superForm(formData, { validators: zodClient(formSchema) });
	const { form: formValues, enhance } = form;
</script>

<div class="h-full pt-24">
	<div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
		<div class="sm:mx-auto sm:w-full sm:max-w-md">
			<h2 class="mt-6 text-center text-2xl leading-9 font-bold tracking-tight">
				{title}
			</h2>
		</div>
		<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
			<div class="px-6 py-12 shadow sm:rounded-lg sm:px-12">
				{#if successMessage}
					<div class="mb-6 rounded-md border border-green-200 bg-green-50 p-4">
						<p class="text-sm text-green-800">{successMessage}</p>
					</div>
				{/if}
				<form method="POST" use:enhance class="space-y-6">
					{#if 'username' in formSchema.shape}
						<Form.Field {form} name="username">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Username</Form.Label>
									<Input
										{...props}
										bind:value={$formValues.username}
										placeholder="Choose a unique username"
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					{/if}
					<Form.Field {form} name="email">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Email address</Form.Label>
								<Input {...props} bind:value={$formValues.email} type="email" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="password">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Password</Form.Label>
								<Input {...props} type="password" bind:value={$formValues.password} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Button>{submitText}</Form.Button>
				</form>
			</div>
			<p class="mt-10 text-center text-sm text-gray-500">
				{linkText}
				<a href={linkHref} class="leading-6 font-semibold text-indigo-600 hover:text-indigo-500">
					{linkLabel}
				</a>
			</p>
		</div>
	</div>
</div>
