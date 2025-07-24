<script lang="ts">
	import { goto } from '$app/navigation';
	const { data: propsData } = $props();
	const { supabase } = propsData;

	let email = $state('');
	let password = $state('');
	let loading = $state(false);

	const handleSignUp = async () => {
		try {
			loading = true;
			const { error } = await supabase.auth.signUp({
				email,
				password
			});
			if (error) throw error;
			alert('Signup successful! Please check your email to confirm your account.');
			goto('/auth/login');
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	};
</script>

<div class="h-full pt-24">
	<div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
		<div class="sm:mx-auto sm:w-full sm:max-w-md">
			<h2 class="mt-6 text-center text-2xl leading-9 font-bold tracking-tight">
				Create your account
			</h2>
		</div>

		<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
			<div class="px-6 py-12 shadow sm:rounded-lg sm:px-12">
				<form class="space-y-6">
					<div>
						<label for="email" class="block text-sm leading-6 font-medium">Email address</label>
						<div class="mt-2">
							<input
								id="email"
								name="email"
								type="email"
								autocomplete="email"
								required
								bind:value={email}
								class="inpt"
							/>
						</div>
					</div>

					<div>
						<label for="password" class="block text-sm leading-6 font-medium">Password</label>
						<div class="mt-2">
							<input
								id="password"
								name="password"
								type="password"
								autocomplete="new-password"
								required
								bind:value={password}
								class="inpt"
							/>
						</div>
					</div>

					<div>
						<button
							onclick={handleSignUp}
							type="submit"
							class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm leading-6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
							disabled={loading}
						>
							{loading ? 'Signing up...' : 'Sign up'}
						</button>
					</div>
				</form>
			</div>

			<p class="mt-10 text-center text-sm text-gray-500">
				Already have an account?
				<a href="/auth/login" class="leading-6 font-semibold text-indigo-600 hover:text-indigo-500">
					Sign in
				</a>
			</p>
		</div>
	</div>
</div>
