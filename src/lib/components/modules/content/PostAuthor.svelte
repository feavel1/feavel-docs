<script lang="ts">
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import type { Post } from '$lib/utils/posts';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { FileStorage } from '$lib/services/storage';

	interface Props {
		post: Post;
		supabase: SupabaseClient;
	}

	let { post, supabase }: Props = $props();

	// State for resolved avatar URL
	let resolvedAvatarUrl = $state('');

	$effect(() => {
		const fetchAvatarUrl = async () => {
			if (post.users?.avatar_file_id) {
				const storage = new FileStorage(supabase);
				const url = await storage.getUrl(post.users.avatar_file_id);
				resolvedAvatarUrl = url || resolvedAvatarUrl;
			} else {
				// Generate default avatar based on username
				resolvedAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.users?.username || 'default')}`;
			}
		};
		fetchAvatarUrl();
	});
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
						src={resolvedAvatarUrl}
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
