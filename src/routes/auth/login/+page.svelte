<script lang="ts">
	import AuthForm from '$lib/components/modules/AuthForm.svelte';
	import { formSchema, type FormSchema } from './schema';
	import { page } from '$app/stores';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';

	let { data }: { data: { form: SuperValidated<Infer<FormSchema>> } } = $props();

	// Get success message from URL params
	let successMessage = $state('');
	$effect(() => {
		const url = new URL($page.url);
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
