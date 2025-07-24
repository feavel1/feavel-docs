<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';

	const { data: propsData } = $props();
	const { supabase, session } = propsData;

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	const handleSignIn = async () => {
		try {
			loading = true;
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password
			});
			if (error) throw error;
			alert('Login successfully, visit your home page❤️!');
			goto('/profile');
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
				Sign in to your account
			</h2>
		</div>

		<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
			<div class=" px-6 py-12 shadow sm:rounded-lg sm:px-12">
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
								autocomplete="current-password"
								required
								bind:value={password}
								class="inpt"
							/>
						</div>
					</div>

					<div class="flex items-center justify-between">
						<div class="flex items-center">
							<input
								id="remember-me"
								name="remember-me"
								type="checkbox"
								class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
							/>
							<label for="remember-me" class="ml-3 block text-sm leading-6">Remember me</label>
						</div>

						<div class="text-sm leading-6">
							<a href="/" class="font-semibold text-indigo-600 hover:text-indigo-500"
								>Forgot password?</a
							>
						</div>
					</div>

					<div>
						<button
							onclick={handleSignIn}
							type="submit"
							class=" flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm leading-6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
						>
							Sign in
						</button>
					</div>
				</form>

				<!-- <div>
					<div class="relative mt-10">
						<div class="absolute inset-0 flex items-center" aria-hidden="true">
							<div class="w-full border-t border-gray-200"></div>
						</div>
						<div class="relative flex justify-center text-sm leading-6 font-medium">
							<span class="bg-black px-6">Or continue with</span>
						</div>
					</div>

					<div class="mt-6 grid grid-cols-2 gap-4">
						<a
							href="/"
							class="flex w-full items-center justify-center gap-3 rounded-md bg-gray-600 px-3 py-1.5 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9BF0]"
						>
							<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
								<path
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									fill="#4285F4"
								/><path
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									fill="#34A853"
								/><path
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									fill="#FBBC05"
								/>
								<path
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									fill="#EA4335"
								/>
								<path d="M1 1h22v22H1z" fill="none" />
							</svg>

							<span class="text-sm leading-6 font-semibold">Google</span>
						</a>

						<a
							href="/"
							class="flex w-full items-center justify-center gap-3 rounded-md bg-[#24292F] px-3 py-1.5 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24292F]"
						>
							<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
								<path
									fill-rule="evenodd"
									d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
									clip-rule="evenodd"
								/>
							</svg>
							<span class="text-sm leading-6 font-semibold">GitHub</span>
						</a>
					</div>
				</div> -->
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
