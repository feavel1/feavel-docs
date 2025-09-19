<script lang="ts">
	import LikeButton from '$lib/components/modules/interactive/LikeButton.svelte';
	import type { Post } from '$lib/utils/posts';
	import type { SupabaseClient } from '@supabase/supabase-js';

	interface Props {
		post: Post;
		supabase: SupabaseClient;
		currentUserId?: string;
	}

	let { post, supabase, currentUserId }: Props = $props();
</script>

<div class="mt-6 flex items-center justify-between">
	<div class="flex items-center gap-4">
		<LikeButton postId={post.id} {supabase} currentUserId={currentUserId} />
	</div>
</div>