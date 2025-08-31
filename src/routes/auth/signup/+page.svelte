<script lang="ts">
	import AuthForm from '$lib/components/modules/forms/AuthForm.svelte';
	import { formSchema, type FormSchema } from './schema';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';

	let { data }: { data: { form: SuperValidated<Infer<FormSchema>> } } = $props();
</script>

<AuthForm
	{formSchema}
	formData={data.form}
	title="Create your account"
	submitText="Sign up"
	linkText="Already have an account? "
	linkHref="/auth/login"
	linkLabel="Sign in"
/>
