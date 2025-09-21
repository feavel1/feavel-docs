<script lang="ts">
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { getAvatarUrl } from '$lib/utils/user';
	import type { Post } from '$lib/utils/posts';
	import type { SupabaseClient } from '@supabase/supabase-js';

	interface Props {
		post: Post;
		supabase: SupabaseClient;
	}

	let { post, supabase }: Props = $props();
</script>

<Card class="mt-6">
	<CardHeader>
		<h3 class="text-lg font-semibold">About the Author</h3>
	</CardHeader>
	<CardContent>
		<div class="flex items-center gap-4">
			<div class="flex-shrink-0">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300">
					<img
						class="h-12 w-12 rounded-full object-cover"
						src={getAvatarUrl(post.users?.avatar_url, post.users?.username, supabase)}
						alt={post.users?.username || 'Author'}
						onerror={(e) => {
							const target = e.target as HTMLImageElement;
							target.style.display = 'none';
							const fallback = target.nextElementSibling as HTMLElement;
							if (fallback) {
								fallback.style.display = 'flex';
							} else {
								// If no fallback element, show the parent container
								target.parentElement!.style.backgroundColor = '#d1d5db'; // gray-300
							}
						}}
					/>

					<span class="text-lg font-medium text-gray-700" style="display: none;">
						{(post.users?.username ?? '').charAt(0).toUpperCase()}
					</span>
				</div>
			</div>
			<div>
				<p class="font-medium">{post.users?.username || 'Unknown'}</p>
				<p class="text-sm text-muted-foreground">
					Published on {new Date(post.created_at).toLocaleDateString()}
				</p>
			</div>
		</div>
	</CardContent>
</Card>
