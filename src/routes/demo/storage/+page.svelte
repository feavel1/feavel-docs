<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { uploadFile, downloadFile, deleteFile, getFileUrl } from '$lib/utils/supabase';
	import { Upload, Download, Trash2, Link } from '@lucide/svelte';

	const { data: propsData } = $props();
	const { session } = propsData;
	const { supabase } = $page.data;

	let isUploading = $state(false);
	let isDownloading = $state(false);
	let isDeleting = $state(false);
	let uploadedFile = $state<{ path: string; url: string } | null>(null);
	let downloadUrl = $state<string | null>(null);

	async function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		if (!target.files || target.files.length === 0) return;

		const file = target.files[0];
		isUploading = true;

		try {
			const result = await uploadFile(supabase, {
				file,
				path: `demo/${session?.user?.id || 'anonymous'}/${file.name}`,
				bucket: 'storage'
			});

			if (result) {
				uploadedFile = result;
				console.log('File uploaded successfully:', result);
			} else {
				console.error('Upload failed');
			}
		} catch (error) {
			console.error('Upload error:', error);
		} finally {
			isUploading = false;
		}
	}

	async function handleDownload() {
		if (!uploadedFile) return;

		isDownloading = true;

		try {
			const blob = await downloadFile(supabase, {
				path: uploadedFile.path,
				bucket: 'storage'
			});

			if (blob) {
				const url = URL.createObjectURL(blob);
				downloadUrl = url;
				console.log('File downloaded successfully');
			} else {
				console.error('Download failed');
			}
		} catch (error) {
			console.error('Download error:', error);
		} finally {
			isDownloading = false;
		}
	}

	async function handleDelete() {
		if (!uploadedFile) return;

		isDeleting = true;

		try {
			const success = await deleteFile(supabase, {
				path: uploadedFile.path,
				bucket: 'storage'
			});

			if (success) {
				uploadedFile = null;
				downloadUrl = null;
				console.log('File deleted successfully');
			} else {
				console.error('Delete failed');
			}
		} catch (error) {
			console.error('Delete error:', error);
		} finally {
			isDeleting = false;
		}
	}

	async function handleGetUrl() {
		if (!uploadedFile) return;

		try {
			const url = await getFileUrl(supabase, {
				path: uploadedFile.path,
				bucket: 'storage'
			});

			if (url) {
				console.log('File URL:', url);
				// Copy to clipboard
				await navigator.clipboard.writeText(url);
				console.log('URL copied to clipboard');
			} else {
				console.error('Failed to get URL');
			}
		} catch (error) {
			console.error('Get URL error:', error);
		}
	}
</script>

<div class="h-full pt-24">
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
		<div class="mb-8">
			<h1 class="text-3xl font-bold">Storage Demo</h1>
			<p class="text-muted-foreground">Test Supabase storage functionality</p>
		</div>

		<div class="grid gap-6 md:grid-cols-2">
			<!-- Upload Section -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Upload class="h-5 w-5" />
						Upload File
					</CardTitle>
					<CardDescription>Upload a file to Supabase storage</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<input
						type="file"
						accept="*/*"
						onchange={handleFileUpload}
						class="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
					/>
					{#if isUploading}
						<p class="text-sm text-muted-foreground">Uploading...</p>
					{/if}
					{#if uploadedFile}
						<div class="rounded-md bg-green-50 p-4">
							<p class="text-sm text-green-800">
								<strong>Uploaded:</strong>
								{uploadedFile.path}
							</p>
						</div>
					{/if}
				</CardContent>
			</Card>

			<!-- Download Section -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Download class="h-5 w-5" />
						Download File
					</CardTitle>
					<CardDescription>Download the uploaded file</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<Button onclick={handleDownload} disabled={!uploadedFile || isDownloading} class="w-full">
						{#if isDownloading}
							Downloading...
						{:else}
							Download File
						{/if}
					</Button>
					{#if downloadUrl}
						<div class="rounded-md bg-blue-50 p-4">
							<p class="text-sm text-blue-800">
								<strong>Downloaded:</strong> File ready for download
							</p>
							<a
								href={downloadUrl}
								download
								class="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800"
							>
								Click to download
							</a>
						</div>
					{/if}
				</CardContent>
			</Card>

			<!-- Get URL Section -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Link class="h-5 w-5" />
						Get Public URL
					</CardTitle>
					<CardDescription>Get the public URL for the file</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<Button onclick={handleGetUrl} disabled={!uploadedFile} class="w-full">
						Get Public URL
					</Button>
					{#if uploadedFile}
						<div class="rounded-md bg-yellow-50 p-4">
							<p class="text-sm text-yellow-800">
								<strong>File:</strong>
								{uploadedFile.path}
							</p>
							<p class="text-sm text-yellow-800">
								<strong>URL:</strong>
								{uploadedFile.url}
							</p>
						</div>
					{/if}
				</CardContent>
			</Card>

			<!-- Delete Section -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Trash2 class="h-5 w-5" />
						Delete File
					</CardTitle>
					<CardDescription>Delete the uploaded file</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<Button
						variant="destructive"
						onclick={handleDelete}
						disabled={!uploadedFile || isDeleting}
						class="w-full"
					>
						{#if isDeleting}
							Deleting...
						{:else}
							Delete File
						{/if}
					</Button>
					{#if uploadedFile}
						<div class="rounded-md bg-red-50 p-4">
							<p class="text-sm text-red-800">
								<strong>Warning:</strong> This action cannot be undone
							</p>
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>

		<div class="mt-8">
			<Card>
				<CardHeader>
					<CardTitle>Instructions</CardTitle>
					<CardDescription>How to test the storage functionality</CardDescription>
				</CardHeader>
				<CardContent>
					<ol class="list-inside list-decimal space-y-2 text-sm">
						<li>Upload a file using the file input</li>
						<li>Download the file to verify it was uploaded correctly</li>
						<li>Get the public URL to see the file's accessible URL</li>
						<li>Delete the file to clean up</li>
					</ol>
					<p class="mt-4 text-sm text-muted-foreground">
						Check the browser console for detailed logs of each operation.
					</p>
				</CardContent>
			</Card>
		</div>
	</div>
</div>
