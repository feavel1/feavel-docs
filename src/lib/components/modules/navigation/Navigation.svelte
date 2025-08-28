<script lang="ts">
	import A from './NavLink.svelte';
	import Group from './NavigationGroup.svelte';
	import LangSwitch from '$lib/components/modules/LangSwitch.svelte';
	import { mostUsedTags } from '$lib/stores/mostUsedTags';
	import { m } from '$lib/paraglide/messages.js';
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

			<Group title="INFO">
				<A href="/auth/login">My Profile</A>

				<A href="/info/docs">Docs</A>
				<A href="/info/calendar">Calendar</A>
				<A href="/info/downloads">Download Center</A>
			</Group>

			<div class="relative mb-10 w-80">
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
			</div>
			<Group title="LANGUAGE / СМЕНИТЬ ЯЗЫК / 更改语言">
				<div class="child:bg-transparent flex flex-row gap-2">
					<LangSwitch />
				</div>
			</Group>
		</div>
	</div>
</div>
