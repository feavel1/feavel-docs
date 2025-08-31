<script lang="ts">
	import A from './NavLink.svelte';
	import Group from './NavigationGroup.svelte';
	import { mostUsedTags } from '$lib/stores/mostUsedTags';
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
				<A href="/services">Services</A>
				<!-- Services -->
			</Group>

			<Group title="COMMUNITY">
				<A href="/member">Members</A>
				<A href="/studios">Chat</A>
				<A href="/auth/login">My Profile</A>
				<A href="/member/chat">Chat</A>
			</Group>

			<Group title="RESOURCES">
				<A href="/resources/calendar">Calendar</A>
				<A href="/resources/docs">Docs</A>
				<A href="/resources/downloads">Download Center</A>
			</Group>
		</div>
	</div>
</div>
