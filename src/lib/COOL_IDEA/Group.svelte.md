<script lang="ts">
	export let title: any;
</script>

<div class="relative mb-10 w-80">
	<h1 class="absolute right-0 top-0 text-xs">{title}</h1>
	<ul class="list">
		<slot />
	</ul>
</div>
