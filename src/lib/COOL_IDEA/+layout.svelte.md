<svelte:head>
	<title>Feavel Docs</title>
</svelte:head>

<ParaglideJS {i18n}>
	<AppBar base="px-4 w-full lg:px-14 pt-2 pb-1 lg:pt-10 fixed top-0 z-50">
		{#snippet lead()}
			<Feavel />
		{/snippet}
		{#snippet trail()}
			<HamburgerModal />
		{/snippet}
	</AppBar>
	<main class="mx-auto min-h-dvh">
		{@render children()}
	</main>
</ParaglideJS>
