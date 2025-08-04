<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { ArrowLeft, Edit, Eye, Calendar, User, Heart } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { Editor, CommentSection, LikeButton } from '$lib/components/modules';
	import { getLikeCount, isPostLiked } from '$lib/utils/likes';
	import { onMount } from 'svelte';

	interface Post {
		id: string;
		title: string;
		content?: string;
		content_v2?: any;
		post_cover?: string;
		post_views?: number;
		created_at: string;
		user_id: string;
		public_visibility: boolean;
		users?: {
			username: string;
			avatar_url?: string;
		};
		posts_tags_rel?: Array<{
			post_tags: {
				tag_name: string;
			};
		}>;
	}

	let { data } = $props();
	let { post, session, supabase } = data;

	let isAuthor = $derived(post?.user_id === session?.user?.id);
	let likeCount = $state(0);
	let isLiked = $state(false);

	function handleBack() {
		goto('/posts');
	}

	function handleEdit() {
		goto(`/posts/edit/${post?.id}`);
	}

	function handleContentChange(data: any) {
		// Read-only mode, no changes needed
	}

	// Load like data when component mounts
	onMount(async () => {
		if (post?.id) {
			likeCount = await getLikeCount(supabase, post.id);
			if (session?.user?.id) {
				isLiked = await isPostLiked(supabase, post.id, session.user.id);
			}
		}
	});
</script>

<svelte:head>
	<title>{post?.title || 'Post Not Found'}</title>
	<meta name="description" content={post?.title || 'Blog post'} />
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<!-- Back Button -->
	<Button variant="ghost" class="mb-6" onclick={handleBack}>
		<ArrowLeft class="mr-2 h-4 w-4" />
		Back to Posts
	</Button>

	{#if post}
		<!-- Post Header -->
		<div class="mb-8">
			<div class="flex items-start justify-between">
				<div class="flex-1">
					<h1 class="mb-4 text-4xl font-bold">{post.title}</h1>
					<div class="mb-6 flex items-center gap-4 text-muted-foreground">
						<div class="flex items-center gap-2">
							<User class="h-4 w-4" />
							<span>{post.users?.username || 'Unknown'}</span>
						</div>
						<div class="flex items-center gap-2">
							<Calendar class="h-4 w-4" />
							<span>{new Date(post.created_at).toLocaleDateString()}</span>
						</div>
						<div class="flex items-center gap-2">
							<Eye class="h-4 w-4" />
							<span>{post.post_views || 0} views</span>
						</div>
					</div>
				</div>
				{#if isAuthor}
					<Button variant="outline" onclick={handleEdit}>
						<Edit class="mr-2 h-4 w-4" />
						Edit
					</Button>
				{/if}
			</div>

			{#if post.post_cover}
				<div class="mb-6 overflow-hidden rounded-lg">
					<img src={post.post_cover} alt="Post cover" class="h-64 w-full object-cover md:h-96" />
				</div>
			{/if}

			{#if post.posts_tags_rel && post.posts_tags_rel.length > 0}
				<div class="mb-6 flex flex-wrap gap-2">
					{#each post.posts_tags_rel as relation (relation.post_tags.tag_name)}
						<Badge variant="secondary">
							{relation.post_tags.tag_name}
						</Badge>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Post Content -->
		<Card>
			<CardContent class="p-6">
				{#if post.content_v2}
					<div class="prose prose-lg max-w-none">
						<Editor content={post.content_v2} readOnly={true} onChange={handleContentChange} />
					</div>
				{:else if post.content}
					<!-- Fallback for legacy content -->
					<div class="prose prose-lg max-w-none">
						{@html post.content}
					</div>
				{:else}
					<p class="text-muted-foreground">No content available.</p>
				{/if}
			</CardContent>
		</Card>

		<!-- Post Actions -->
		<div class="mt-8 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<LikeButton
					postId={post.id}
					currentUserId={session?.user?.id}
					{supabase}
					initialLikeCount={likeCount}
					initialIsLiked={isLiked}
				/>
			</div>
		</div>

		<!-- Author Info -->
		<Card class="mt-8">
			<CardHeader>
				<h3 class="text-lg font-semibold">About the Author</h3>
			</CardHeader>
			<CardContent>
				<div class="flex items-center gap-4">
					<Avatar class="h-12 w-12">
						<AvatarImage src={post.users?.avatar_url} alt={post.users?.username} />
						<AvatarFallback>
							{post.users?.username?.charAt(0)?.toUpperCase() || 'U'}
						</AvatarFallback>
					</Avatar>
					<div>
						<p class="font-medium">{post.users?.username || 'Unknown'}</p>
						<p class="text-sm text-muted-foreground">
							Published on {new Date(post.created_at).toLocaleDateString()}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Comments Section -->
		<CommentSection
			postId={post.id}
			postAuthorId={post.user_id}
			currentUserId={session?.user?.id}
			currentUser={session?.user}
			{supabase}
		/>
	{:else}
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<div class="mb-4 rounded-full bg-muted p-4">
				<Eye class="h-8 w-8 text-muted-foreground" />
			</div>
			<h3 class="mb-2 text-lg font-semibold">Post Not Found</h3>
			<p class="mb-4 text-muted-foreground">
				The post you're looking for doesn't exist or has been removed.
			</p>
			<Button href="/posts">
				<ArrowLeft class="mr-2 h-4 w-4" />
				Back to Posts
			</Button>
		</div>
	{/if}
</div>
