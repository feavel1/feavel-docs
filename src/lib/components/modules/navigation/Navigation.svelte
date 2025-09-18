<script lang="ts">
	import A from './NavLink.svelte';
	import Group from './NavigationGroup.svelte';
	import { mostUsedTags } from '$lib/stores/mostUsedTags';
	import { mostUsedCategories } from '$lib/stores/mostUsedCategories';
</script>

<div class="mx-auto h-screen w-screen px-4 font-thin lg:px-14">
	<div class="absolute bottom-20">
		<div class="grid-cols-2 gap-x-14 lg:grid">
			<Group title="POSTS">
				{#each $mostUsedTags.tags as tag}
					<A href="/posts?tags={tag}">{tag.toLocaleUpperCase()}</A>
				{/each}
			</Group>

			<Group title="SERVICES">
				{#each $mostUsedCategories.categories as category}
					<A href="/services?categories={category}">{category.toLocaleUpperCase()}</A>
				{/each}
			</Group>

			<Group title="COMMUNITY">
				<A href="/member">Members</A>
				<A href="/studio">Studios</A>
				<A href="/member/dashboard">Dashboard</A>
				<A href="/member/dashboard/messages">Messages</A>
			</Group>

			<Group title="RESOURCES">
				<A href="/resources/calendar">Calendar</A>
				<A href="/resources/docs">Docs</A>
				<A href="/resources/downloads">Download Center</A>
			</Group>
		</div>
	</div>
</div>
