<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { ArrowLeft, Edit, Eye, Calendar, User } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { Editor, CommentSection, LikeButton } from '$lib/components/modules';
	import { getAvatarUrl } from '$lib/utils/user';

	let { post, session, supabase } = $props();

	let isAuthor = $derived(post?.user_id === session?.user?.id);

	function handleBack() {
		goto('/posts');
	}

	function handleEdit() {
		goto(`/posts/edit/${post?.id}`);
	}

	function handleContentChange(_data: any) {
		// Read-only mode, no changes needed
	}
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
				<LikeButton postId={post.id} {supabase} currentUserId={session?.user?.id} />
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
						<AvatarImage
							src={getAvatarUrl(post.users?.avatar_url, post.users?.username, supabase)}
							alt={post.users?.username}
						/>
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
