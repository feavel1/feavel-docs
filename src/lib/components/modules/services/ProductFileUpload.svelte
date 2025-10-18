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
	let currentProductId = $state<string | null>(null);

	// Initialize and fetch existing file ID when component mounts
	$effect(() => {
		if (supabase) {
			serviceDownloads = new ServiceDownloads(supabase);

			// Try to get existing file info from server
			serviceDownloads!.getServiceFiles(serviceId).then((existingFiles) => {
				if (existingFiles && existingFiles.product_file_id) {
					currentProductId = existingFiles.product_file_id;
				}
			});
		}
	});

	// Update product display information when currentProductId changes
	$effect(() => {
		(async () => {
			if (currentProductId && serviceDownloads) {
				await serviceDownloads.getServiceFiles(serviceId);
				// For product files, we don't display the actual file but show file info
				// We just need to know that a file is uploaded
			}
		})();
	});

	async function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		// Basic file validation
		if (file.size > 100 * 1024 * 1024) {
			toast.error('File size must be less than 100MB');
			return;
		}

		uploading = true;

		try {
			if (serviceDownloads) {
				const result = await serviceDownloads.uploadProductFile(serviceId, file);

				if (result) {
					toast.success('Product file uploaded successfully');
					currentProductId = result;
				} else {
					toast.error('Failed to upload product file');
				}
			} else {
				toast.error('Service downloads not initialized');
			}
		} catch (error) {
			console.error('Upload error:', error);
			toast.error('Failed to upload product file');
		} finally {
			uploading = false;
			if (fileInput) fileInput.value = '';
		}
	}

	async function handleRemoveProduct() {
		if (!currentProductId) return;

		uploading = true;

		try {
			if (serviceDownloads) {
				const success = await serviceDownloads.removeProductFile(serviceId);

				if (success) {
					toast.success('Product file removed successfully');
					currentProductId = null;
				} else {
					toast.error('Failed to remove product file');
				}
			} else {
				toast.error('Service downloads not initialized');
			}
		} catch (error) {
			console.error('Remove error:', error);
			toast.error('Failed to remove product file');
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
		<CardTitle>Product File</CardTitle>
		<CardDescription>
			Upload the full product file that customers will download after purchase. This file will be
			private and only accessible to customers who have purchased this service.
		</CardDescription>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="flex flex-col items-center space-y-4">
			{#if currentProductId}
				<div class="w-full max-w-xs rounded-lg border bg-muted p-4">
					<div class="flex items-center space-x-2">
						<div class="text-2xl">🔒</div>
						<div>
							<p class="font-medium">Product File Uploaded</p>
							<p class="text-sm text-muted-foreground">Private - Only accessible to purchasers</p>
						</div>
					</div>
				</div>
			{:else}
				<div
					class="flex h-24 w-full max-w-xs items-center justify-center rounded-lg border border-dashed bg-muted"
				>
					<span class="text-muted-foreground">No product file uploaded</span>
				</div>
			{/if}

			<div class="flex w-full max-w-xs flex-col space-y-2">
				<input bind:this={fileInput} type="file" class="hidden" onchange={handleFileSelect} />

				<Button onclick={handleClick} disabled={uploading} variant="outline" class="w-full">
					{uploading ? 'Uploading...' : 'Upload Product'}
				</Button>

				{#if currentProductId}
					<Button
						onclick={handleRemoveProduct}
						disabled={uploading}
						variant="destructive"
						size="sm"
						class="w-full"
					>
						{uploading ? 'Removing...' : 'Remove Product'}
					</Button>
				{/if}
			</div>

			<div class="text-center text-sm text-muted-foreground">
				<p>Upload your full product file (any file type)</p>
				<p>Maximum file size: 100MB</p>
			</div>
		</div>
	</CardContent>
</Card>
