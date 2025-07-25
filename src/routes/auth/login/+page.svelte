<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { superForm, type SuperValidated, type Infer } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { formSchema, type FormSchema } from './schema';
	let { data }: { data: { form: SuperValidated<Infer<FormSchema>> } } = $props();
	const form = superForm(data.form, { validators: zodClient(formSchema) });
	const { form: formData, enhance } = form;
</script>

<div class="h-full pt-24">
	<div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
		<div class="sm:mx-auto sm:w-full sm:max-w-md">
			<h2 class="mt-6 text-center text-2xl leading-9 font-bold tracking-tight">
				Sign in to your account
			</h2>
		</div>
		<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
			<div class="px-6 py-12 shadow sm:rounded-lg sm:px-12">
				<form method="POST" use:enhance class="space-y-6">
					<Form.Field {form} name="email">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Email address</Form.Label>
								<Input {...props} bind:value={$formData.email} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="password">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Password</Form.Label>
								<Input {...props} type="password" bind:value={$formData.password} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Button>Sign in</Form.Button>
				</form>
			</div>
			<p class="mt-10 text-center text-sm text-gray-500">
				Not a member?
				<a
					href="/auth/signup"
					class="leading-6 font-semibold text-indigo-600 hover:text-indigo-500"
				>
					Register
				</a>
			</p>
		</div>
	</div>
</div>
