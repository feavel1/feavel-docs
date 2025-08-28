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
				<A href="/member/chat">Chat</A>
				<A href="/member">Members</A>
				<A href="/auth/login">My Profile</A>
			</Group>

			<Group title="RESOURCES">
				<A href="/info/docs">Docs</A>
				<A href="/info/calendar">Calendar</A>
				<A href="/info/downloads">Download Center</A>
			</Group>

			<!-- <div class="relative mb-10 w-80">
				<h1 class="absolute top-0 right-0 text-xs">Contact</h1>
				<ul class="list">
					<li>
						<p>FEAVEL DOCS</p>
					</li>
					<li>
						<p>Leave a comment</p>
					</li>
					<A href="/member">Members</A>
				</ul>
			</div> -->
			<!-- 
			<Group title="LANGUAGE / СМЕНИТЬ ЯЗЫК / 更改语言">
			</Group> -->
		</div>
	</div>
</div>
