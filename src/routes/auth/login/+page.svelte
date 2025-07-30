<script lang="ts">
	import AuthForm from '$lib/components/modules/AuthForm.svelte';
	import { formSchema, type FormSchema } from './schema';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';

	let {
		data,
		url
	}: {
		data: { form: SuperValidated<Infer<FormSchema>> };
		url: URL;
	} = $props();

	// Get success message from URL params
	let successMessage = $state('');
	$effect(() => {
		successMessage = url.searchParams.get('message') || '';
	});
</script>

<AuthForm
	{formSchema}
	formData={data.form}
	title="Sign in to your account"
	submitText="Sign in"
	linkText="Not a member? "
	linkHref="/auth/signup"
	linkLabel="Register"
	{successMessage}
/>
