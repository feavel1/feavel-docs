<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Heart } from '@lucide/svelte';
	import { toggleLike, getLikeInfo } from '$lib/utils/likes';
	import { toast } from 'svelte-sonner';
	import type { SupabaseClient } from '@supabase/supabase-js';

	interface Props {
		postId: string | number;
		supabase: SupabaseClient;
		currentUserId?: string;
	}

	let { postId, supabase, currentUserId }: Props = $props();

	let likeCount = $state(0);
	let isLiked = $state(false);
	let isSubmitting = $state(false);

	async function handleToggleLike() {
		if (!currentUserId || isSubmitting) return;

		// Store previous state for rollback on error
		const previousIsLiked = isLiked;
		const previousLikeCount = likeCount;

		// Optimistic UI update
		isLiked = !isLiked;
		likeCount = isLiked ? likeCount + 1 : Math.max(0, likeCount - 1);

		isSubmitting = true;
		try {
			const result = await toggleLike(supabase, postId, currentUserId);
			if (!result.success) {
				// Rollback on failure
				isLiked = previousIsLiked;
				likeCount = previousLikeCount;
				toast.error('Failed to update like. Please try again.');
			} else {
				// Update state with actual result (in case of discrepancy)
				isLiked = result.isLiked;
				// The like count should be automatically updated through cache invalidation in toggleLike
			}
		} catch (error) {
			// Rollback on error
			isLiked = previousIsLiked;
			likeCount = previousLikeCount;
			console.error('Error toggling like:', error);
			toast.error('Failed to update like. Please try again.');
		} finally {
			isSubmitting = false;
		}
	}

	// Initialize like state when component mounts
	$effect(() => {
		if (postId) {
			// Get both like count and user's like status in one call
			getLikeInfo(supabase, postId, currentUserId).then(({ count, isLiked: liked }) => {
				likeCount = count;
				isLiked = liked;
			});
		}
	});
</script>

<Button
	variant={isLiked ? 'default' : 'outline'}
	onclick={handleToggleLike}
	disabled={!currentUserId || isSubmitting}
	class="gap-2"
>
	{#if isSubmitting}
		<div
			class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
		></div>
	{:else}
		<Heart class="h-4 w-4 {isLiked ? 'fill-red-500 text-red-500' : ''}" />
	{/if}
	{likeCount}
</Button>
