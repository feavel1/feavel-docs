<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { BookOpen, Users, FileText, Plus } from '@lucide/svelte';
</script>

<svelte:head>
	<title>Feavel Docs - Documentation Platform</title>
	<meta name="description" content="A modern documentation platform with blog features" />
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-8">
	<!-- Header -->
	<div class="mb-12 text-center">
		<h1 class="mb-4 text-4xl font-bold">Welcome to Feavel Docs</h1>
		<p class="text-xl text-muted-foreground">
			A modern documentation platform with powerful blog features
		</p>
	</div>

	<!-- Navigation Cards -->
	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		<Card class="group transition-all hover:shadow-lg">
			<CardHeader>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-primary/10 p-2">
						<FileText class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Blog Posts</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				<p class="mb-4 text-muted-foreground">
					Discover stories, ideas, and insights from our community. Read and share knowledge through
					our rich content editor.
				</p>
				<div class="flex gap-2">
					<Button href="/posts" class="flex-1">Browse Posts</Button>
					<Button href="/posts/new" variant="outline" size="sm">
						<Plus class="mr-2 h-4 w-4" />
						New Post
					</Button>
				</div>
			</CardContent>
		</Card>

		<Card class="group transition-all hover:shadow-lg">
			<CardHeader>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-primary/10 p-2">
						<Users class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Member Area</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				<p class="mb-4 text-muted-foreground">
					Access your profile, manage your account, and view your personal dashboard.
				</p>
				<Button href="/member" class="w-full">Go to Member Area</Button>
			</CardContent>
		</Card>

		<Card class="group transition-all hover:shadow-lg">
			<CardHeader>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-primary/10 p-2">
						<BookOpen class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Documentation</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				<p class="mb-4 text-muted-foreground">
					Explore our comprehensive documentation and guides for using the platform.
				</p>
				<Button href="/docs" variant="outline" class="w-full">View Documentation</Button>
			</CardContent>
		</Card>
	</div>

	<!-- Features Section -->
	<div class="mt-16">
		<h2 class="mb-8 text-center text-2xl font-semibold">Platform Features</h2>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Rich Content Editor</h3>
				<p class="text-muted-foreground">
					Create beautiful blog posts with our advanced Editor.js integration. Support for headers,
					lists, code blocks, images, tables, and more.
				</p>
			</div>
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Tag System</h3>
				<p class="text-muted-foreground">
					Organize your content with a flexible tagging system. Filter posts by tags and discover
					related content easily.
				</p>
			</div>
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Search & Discovery</h3>
				<p class="text-muted-foreground">
					Find the content you need with our powerful search functionality. Search through titles,
					content, and author names.
				</p>
			</div>
			<div class="space-y-4">
				<h3 class="text-lg font-medium">User Management</h3>
				<p class="text-muted-foreground">
					Secure authentication and user profiles. Manage your posts, drafts, and account settings.
				</p>
			</div>
		</div>
	</div>
</div>
