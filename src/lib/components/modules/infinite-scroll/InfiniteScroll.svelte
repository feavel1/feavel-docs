<script lang="ts">
	// Props
	let { hasMore = true, isLoading = false, threshold = 0.1, loadMore, loadingContent } = $props();

	// State
	let sentinelElement: HTMLDivElement | undefined = $state(undefined);

	// Effects
	$effect(() => {
		if (!sentinelElement || !loadMore) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !isLoading) {
					loadMore();
				}
			},
			{ threshold }
		);

		observer.observe(sentinelElement);

		return () => observer.disconnect();
	});
</script>

<!-- Render sentinel element for intersection detection -->
{#if hasMore}
	<div bind:this={sentinelElement} style="height: 1px"></div>
{/if}

<!-- Loading indicator -->
{#if isLoading}
	{#if loadingContent}
		{@render loadingContent()}
	{:else}
		<div>Loading more...</div>
	{/if}
{/if}
