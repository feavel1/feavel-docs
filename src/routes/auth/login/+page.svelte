<script lang="ts">
	import AuthForm from '$lib/components/modules/forms/AuthForm.svelte';
	import { formSchema } from './schema';

	let { data } = $props();

	// Get success message from URL params
	let successMessage = $state('');
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
