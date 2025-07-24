<script lang="ts">
	const { data: propsData } = $props();
	const { session } = propsData;

	let user = session?.user;
</script>

<div class="h-full pt-24">
	<div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
		<div class="sm:mx-auto sm:w-full sm:max-w-md">
			<h2 class="mt-6 text-center text-2xl leading-9 font-bold tracking-tight">User Profile</h2>
		</div>

		<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
			<div class="px-6 py-12 shadow sm:rounded-lg sm:px-12">
				{#if user}
					<div class="space-y-4">
						<div>
							<span class="font-semibold">User ID:</span>
							{user.id}
						</div>
						<div>
							<span class="font-semibold">Email:</span>
							{user.email}
						</div>
					</div>
				{:else}
					<div class="text-center text-gray-500">
						You are not logged in.<br />
						<a href="/auth/login" class="font-semibold text-indigo-600 hover:text-indigo-500"
							>Login</a
						>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
