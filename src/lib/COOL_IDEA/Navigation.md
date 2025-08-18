<script lang="ts">
	import A from './A.svelte';
	import Group from './Group.svelte';
	import LangSwitch from './LangSwitch.svelte';
</script>

<div class="mx-auto h-screen w-screen px-4 font-thin lg:px-14">
	<div class="absolute bottom-20">
		<div class="grid-cols-2 gap-x-14 lg:grid">
			<Group title="WORKS">
				<A href="/works/posts">Posts</A>

				<A href="/">Music</A>

				<A href="/">Research</A>

				<A href="/">Visual Arts</A>

				<A href="/">Philosophy</A>

				<A href="/">Photography</A>
			</Group>

			<Group title="INFO">
				<A href="/info/about">About</A>
				<A href="/auth/login">Profile</A>

				<A href="/info/services">Services</A>
				<A href="/info/calendar">Calendar</A>
				<A href="/info/downloads">Download Center</A>

				<!-- {#if session}
				{:else}
					<A href="/auth/login">Login / Register</A>
				{/if} -->
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
				</ul>
			</div>
			<Group title="LANGUAGE / СМЕНИТЬ ЯЗЫК / 更改语言">
				<div class="child:bg-transparent flex flex-row gap-2">
					<!-- <select class="">
						<option value="1">Catppuccin</option>
						<option value="2">Pine</option>
						<option value="3">Rose</option>
					</select> -->

					<LangSwitch />
				</div>
			</Group>
		</div>
	</div>
</div>
