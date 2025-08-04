<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Heart } from '@lucide/svelte';
	import { toggleLike, getLikeCount } from '$lib/utils/likes';
	import type { SupabaseClient } from '@supabase/supabase-js';

	interface Props {
		postId: number;
		currentUserId?: string;
		supabase: SupabaseClient;
		initialLikeCount?: number;
		initialIsLiked?: boolean;
	}

	let { postId, currentUserId, supabase, initialLikeCount = 0, initialIsLiked = false } = $props();

	let likeCount = $state(initialLikeCount);
	let isLiked = $state(initialIsLiked);
	let isSubmitting = $state(false);

	async function handleToggleLike() {
		if (!currentUserId || isSubmitting) return;

		isSubmitting = true;
		try {
			const result = await toggleLike(supabase, postId, currentUserId);
			if (result.success) {
				isLiked = result.isLiked;
				likeCount += result.isLiked ? 1 : -1;
			}
		} catch (error) {
			console.error('Error toggling like:', error);
		} finally {
			isSubmitting = false;
		}
	}

	// Update like count when component mounts
	$effect(() => {
		if (currentUserId) {
			getLikeCount(supabase, postId).then((count) => {
				likeCount = count;
			});
		}
	});
</script>

<Button
	variant={isLiked ? 'default' : 'outline'}
	size="sm"
	onclick={handleToggleLike}
	disabled={!currentUserId || isSubmitting}
	class="gap-2"
>
	<Heart class="h-4 w-4 {isLiked ? 'fill-red-500 text-red-500' : ''}" />
	{likeCount}
</Button>
