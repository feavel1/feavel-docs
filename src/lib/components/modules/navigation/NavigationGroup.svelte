<script lang="ts">
	export let title: string;
</script>

<div class="relative mb-10 w-80">
	<h1 class="absolute top-0 right-0 text-xs font-medium text-muted-foreground">{title}</h1>
	<ul class="mt-6 list-none space-y-2">
		<slot />
	</ul>
</div>
