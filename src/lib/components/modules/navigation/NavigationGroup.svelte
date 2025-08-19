<script lang="ts">
	export let title: string;
</script>

<div class="relative mb-10 w-80">
	<h1 class="absolute right-0 top-0 text-xs font-medium text-muted-foreground">{title}</h1>
	<ul class="list-none mt-6 space-y-2">
		<slot />
	</ul>
</div>