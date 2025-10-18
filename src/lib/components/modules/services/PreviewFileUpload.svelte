<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import { ServiceDownloads } from '$lib/utils/serviceDownloads';

	const { supabase, serviceId } = $props();
	let uploading = $state(false);
	let fileInput: HTMLInputElement;
	let serviceDownloads: ServiceDownloads;
	let currentPreviewId = $state<string | null>(null);
	let previewDisplayUrl = $state('');

	// Initialize and fetch existing file ID when component mounts
	$effect(() => {
		if (supabase) {
			serviceDownloads = new ServiceDownloads(supabase);

			// Try to get existing file info from server
			serviceDownloads!.getServiceFiles(serviceId).then((existingFiles) => {
				if (existingFiles && existingFiles.preview_file_id) {
					currentPreviewId = existingFiles.preview_file_id;
					previewDisplayUrl = existingFiles.preview_file_url || '';
				}
			});
		}
	});

	// Update preview display URL when currentPreviewId changes
	$effect(() => {
		(async () => {
			if (currentPreviewId && serviceDownloads) {
				// We already have the preview URL from initialization, but update if needed
				const url = await serviceDownloads.getServiceFiles(serviceId);
				if (url && url.preview_file_url) {
					previewDisplayUrl = url.preview_file_url;
				}
			} else {
				previewDisplayUrl = '';
			}
		})();
	});

	async function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		// Basic file validation
		if (file.size > 50 * 1024 * 1024) {
			toast.error('File size must be less than 50MB');
			return;
		}

		uploading = true;

		try {
			if (serviceDownloads) {
				const result = await serviceDownloads.uploadPreviewFile(serviceId, file);

				if (result) {
					toast.success('Preview file uploaded successfully');
					currentPreviewId = result;
				} else {
					toast.error('Failed to upload preview file');
				}
			} else {
				toast.error('Service downloads not initialized');
			}
		} catch (error) {
			console.error('Upload error:', error);
			toast.error('Failed to upload preview file');
		} finally {
			uploading = false;
			if (fileInput) fileInput.value = '';
		}
	}

	async function handleRemovePreview() {
		if (!currentPreviewId) return;

		uploading = true;

		try {
			if (serviceDownloads) {
				const success = await serviceDownloads.removePreviewFile(serviceId);

				if (success) {
					toast.success('Preview file removed successfully');
					currentPreviewId = null;
				} else {
					toast.error('Failed to remove preview file');
				}
			} else {
				toast.error('Service downloads not initialized');
			}
		} catch (error) {
			console.error('Remove error:', error);
			toast.error('Failed to remove preview file');
		} finally {
			uploading = false;
		}
	}

	function handleClick() {
		fileInput?.click();
	}
</script>

<Card>
	<CardHeader>
		<CardTitle>Preview File</CardTitle>
		<CardDescription>
			Upload a preview file that will be publicly accessible. This could be a sample or thumbnail of
			your download.
		</CardDescription>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="flex flex-col items-center space-y-4">
			{#if previewDisplayUrl}
				<div class="relative w-full max-w-xs">
					{#if previewDisplayUrl.endsWith('.pdf')}
						<div class="flex h-32 w-full items-center justify-center rounded-lg border bg-muted">
							<div class="text-center">
								<div class="text-4xl">📄</div>
								<p class="text-sm text-muted-foreground">PDF Preview</p>
							</div>
						</div>
					{:else if previewDisplayUrl.match(/\.(mp3|wav|flac|aac|m4a)$/i)}
						<div class="flex h-32 w-full items-center justify-center rounded-lg border bg-muted">
							<div class="text-center">
								<div class="text-4xl">🎵</div>
								<p class="text-sm text-muted-foreground">Audio Preview</p>
							</div>
						</div>
					{:else if previewDisplayUrl.match(/\.(mp4|mov|avi|mkv)$/i)}
						<div class="flex h-32 w-full items-center justify-center rounded-lg border bg-muted">
							<div class="text-center">
								<div class="text-4xl">🎬</div>
								<p class="text-sm text-muted-foreground">Video Preview</p>
							</div>
						</div>
					{:else}
						<img
							src={previewDisplayUrl}
							alt="Preview"
							class="h-32 w-full rounded-lg object-cover"
							onerror={() => {
								// Fallback for unsupported file types
								previewDisplayUrl = '';
							}}
						/>
					{/if}
				</div>
			{:else}
				<div
					class="flex h-32 w-full max-w-xs items-center justify-center rounded-lg border border-dashed bg-muted"
				>
					<span class="text-muted-foreground">No preview uploaded</span>
				</div>
			{/if}

			<div class="flex w-full max-w-xs flex-col space-y-2">
				<input bind:this={fileInput} type="file" class="hidden" onchange={handleFileSelect} />

				<Button onclick={handleClick} disabled={uploading} variant="outline" class="w-full">
					{uploading ? 'Uploading...' : 'Upload Preview'}
				</Button>

				{#if currentPreviewId}
					<Button
						onclick={handleRemovePreview}
						disabled={uploading}
						variant="destructive"
						size="sm"
						class="w-full"
					>
						{uploading ? 'Removing...' : 'Remove Preview'}
					</Button>
				{/if}
			</div>

			<div class="text-center text-sm text-muted-foreground">
				<p>Upload a preview file (any file type)</p>
				<p>Maximum file size: 50MB</p>
			</div>
		</div>
	</CardContent>
</Card>
