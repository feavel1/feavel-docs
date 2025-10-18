<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { ServiceDownloads } from '$lib/utils/serviceDownloads';

	const { supabase, serviceId, canAccessProduct = false } = $props();
	let serviceDownloads: ServiceDownloads;

	let previewUrl = $state<string | null>(null);
	let productUrl = $state<string | null>(null);
	let availableFiles = $state({
		hasPreview: false,
		hasProduct: false
	});
	let loading = $state(true);

	// Initialize service downloads only once when supabase is available
	if (supabase) {
		serviceDownloads = new ServiceDownloads(supabase);
	}

	// Load file information when component mounts
	$effect(() => {
		(async () => {
			if (serviceDownloads && serviceId) {
				try {
					const files = await serviceDownloads.getServiceFiles(serviceId);
					if (files) {
						previewUrl = files.preview_file_url;
						productUrl = files.product_file_url; // This will be the signed URL if user can access
						availableFiles = {
							hasPreview: !!files.preview_file_id,
							hasProduct: !!files.product_file_id
						};
					}
				} catch (error) {
					console.error('Failed to load file information:', error);
				} finally {
					loading = false;
				}
			}
		})();
	});

	// Load product file URL only if user can access
	$effect(() => {
		if (canAccessProduct && serviceDownloads && serviceId) {
			(async () => {
				const files = await serviceDownloads.getServiceFiles(serviceId);
				if (files?.product_file_id) {
					// Get signed URL for the product file via the serviceDownloads instance
					const signedUrl = await serviceDownloads['storage'].getSignedUrl(files.product_file_id);
					productUrl = signedUrl;
				}
			})();
		}
	});

	function handlePreviewDownload(event: Event) {
		event.preventDefault();
		if (previewUrl) {
			window.open(previewUrl, '_blank');
		}
	}

	function handleProductDownload(event: Event) {
		event.preventDefault();
		if (productUrl && canAccessProduct) {
			window.open(productUrl, '_blank');
		} else {
			toast.error('Product file is not available or you do not have access to it');
		}
	}
</script>

{#if loading}
	<Card class="mb-8">
		<CardContent class="flex h-24 items-center justify-center">
			<p>Loading file information...</p>
		</CardContent>
	</Card>
{:else if availableFiles.hasPreview || availableFiles.hasProduct}
	<Card class="mb-8">
		<CardHeader>
			<CardTitle>Download Files</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if availableFiles.hasPreview}
				<div>
					<p class="mb-2 text-sm font-medium">Preview File</p>
					<div class="flex items-center gap-2">
						{#if previewUrl?.endsWith('.pdf')}
							<div class="flex items-center gap-2 text-muted-foreground">
								<span>📄</span>
								<span>PDF Preview File</span>
							</div>
						{:else if previewUrl?.match(/\.(mp3|wav|flac|aac|m4a)$/i)}
							<div class="flex items-center gap-2 text-muted-foreground">
								<span>🎵</span>
								<span>Audio Preview File</span>
							</div>
						{:else if previewUrl?.match(/\.(mp4|mov|avi|mkv)$/i)}
							<div class="flex items-center gap-2 text-muted-foreground">
								<span>🎬</span>
								<span>Video Preview File</span>
							</div>
						{:else}
							<div class="flex items-center gap-2 text-muted-foreground">
								<span>📁</span>
								<span>Preview File</span>
							</div>
						{/if}
						<Button onclick={handlePreviewDownload} size="sm" variant="outline">Download</Button>
					</div>
				</div>
			{/if}

			{#if availableFiles.hasProduct}
				<div>
					<p class="mb-2 text-sm font-medium">
						Product File {#if !canAccessProduct}(Purchase Required){/if}
					</p>
					<div class="flex items-center gap-2">
						{#if productUrl?.match(/\.(mp3|wav|flac|aac|m4a)$/i)}
							<div class="flex items-center gap-2 text-muted-foreground">
								<span>🔒🎵</span>
								<span>Product Audio File</span>
							</div>
						{:else if productUrl?.match(/\.(mp4|mov|avi|mkv)$/i)}
							<div class="flex items-center gap-2 text-muted-foreground">
								<span>🔒🎬</span>
								<span>Product Video File</span>
							</div>
						{:else}
							<div class="flex items-center gap-2 text-muted-foreground">
								<span>🔒📁</span>
								<span>Product File</span>
							</div>
						{/if}
						<Button
							onclick={handleProductDownload}
							size="sm"
							variant={canAccessProduct ? 'default' : 'outline'}
							disabled={!canAccessProduct}
						>
							{canAccessProduct ? 'Download' : 'Purchase Required'}
						</Button>
					</div>
				</div>
			{/if}
		</CardContent>
	</Card>
{/if}
