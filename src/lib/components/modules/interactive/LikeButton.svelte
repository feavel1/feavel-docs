<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Heart } from '@lucide/svelte';
	import { toggleLike, getLikeCount, isPostLiked } from '$lib/utils/likes';
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

		isSubmitting = true;
		try {
			const result = await toggleLike(supabase, postId, currentUserId);
			if (result.success) {
				isLiked = result.isLiked;
				// Update like count based on the action
				if (result.isLiked) {
					likeCount += 1;
				} else {
					likeCount = Math.max(0, likeCount - 1);
				}
			}
		} catch (error) {
			console.error('Error toggling like:', error);
		} finally {
			isSubmitting = false;
		}
	}

	// Initialize like state when component mounts
	$effect(() => {
		if (postId && currentUserId) {
			// Get current like count
			getLikeCount(supabase, postId).then((count) => {
				likeCount = count;
			});

			// Get current like status
			isPostLiked(supabase, postId, currentUserId).then((liked) => {
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
	<Heart class="h-4 w-4 {isLiked ? 'fill-red-500 text-red-500' : ''}" />
	{likeCount}
</Button>
