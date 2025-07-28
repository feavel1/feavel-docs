<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { uploadUserAvatar } from '$lib/utils/supabase.js';
	import { getAvatarDisplayUrl as getUserAvatarUrl } from '$lib/utils/user.js';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogTrigger
	} from '$lib/components/ui/alert-dialog';

	export let supabase: SupabaseClient;
	export let userId: string;
	export let currentAvatarUrl: string | null = null;
	export let username: string = '';

	const dispatch = createEventDispatcher<{
		upload: { success: boolean; url?: string; error?: string };
	}>();

	let isUploading = false;
	let uploadError = '';
	let uploadSuccess = false;
	let fileInput: HTMLInputElement;
	let showConfirmDialog = false;
	let selectedFile: File | null = null;
	let previewUrl = '';

	// Get display URL for current avatar
	$: displayUrl = currentAvatarUrl || getUserAvatarUrl(null, username);

	// Compress image before upload
	async function compressImage(file: File): Promise<File> {
		return new Promise((resolve) => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			const img = new Image();

			img.onload = () => {
				// Set canvas size (max 400x400 for avatars)
				const maxSize = 400;
				let { width, height } = img;

				if (width > height) {
					if (width > maxSize) {
						height = (height * maxSize) / width;
						width = maxSize;
					}
				} else {
					if (height > maxSize) {
						width = (width * maxSize) / height;
						height = maxSize;
					}
				}

				canvas.width = width;
				canvas.height = height;

				// Draw and compress
				ctx?.drawImage(img, 0, 0, width, height);

				canvas.toBlob(
					(blob) => {
						if (blob) {
							const compressedFile = new File([blob], file.name, {
								type: 'image/jpeg',
								lastModified: Date.now()
							});
							resolve(compressedFile);
						} else {
							resolve(file);
						}
					},
					'image/jpeg',
					0.8 // 80% quality
				);
			};

			img.src = URL.createObjectURL(file);
		});
	}

	async function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('image/')) {
			uploadError = 'Please select an image file';
			return;
		}

		// Validate file size (max 10MB before compression)
		if (file.size > 10 * 1024 * 1024) {
			uploadError = 'File size must be less than 10MB';
			return;
		}

		// Create preview
		selectedFile = file;
		previewUrl = URL.createObjectURL(file);
		showConfirmDialog = true;
		uploadError = '';
	}

	async function confirmUpload() {
		if (!selectedFile) return;

		isUploading = true;
		uploadError = '';
		uploadSuccess = false;

		try {
			// Compress the image
			const compressedFile = await compressImage(selectedFile);

			// Upload the compressed file
			const result = await uploadUserAvatar(supabase, compressedFile, userId);

			if (result) {
				uploadSuccess = true;
				// Update the display URL immediately
				currentAvatarUrl = result.url;
				dispatch('upload', { success: true, url: result.url });
			} else {
				uploadError = 'Failed to upload avatar';
				dispatch('upload', { success: false, error: 'Upload failed' });
			}
		} catch (error) {
			uploadError = 'Upload failed';
			dispatch('upload', { success: false, error: 'Upload failed' });
		} finally {
			isUploading = false;
			showConfirmDialog = false;
			selectedFile = null;
			previewUrl = '';
			// Reset file input
			if (fileInput) {
				fileInput.value = '';
			}
			// Clear success message after 3 seconds
			if (uploadSuccess) {
				setTimeout(() => {
					uploadSuccess = false;
				}, 3000);
			}
		}
	}

	function cancelUpload() {
		showConfirmDialog = false;
		selectedFile = null;
		previewUrl = '';
		uploadError = '';
		if (fileInput) {
			fileInput.value = '';
		}
	}

	function triggerFileSelect() {
		fileInput?.click();
	}
</script>

<div class="flex flex-col items-center gap-4">
	<Avatar class="h-24 w-24">
		<AvatarImage src={displayUrl} alt="Avatar" class="object-cover" />
		<AvatarFallback class="text-lg font-semibold">
			{username?.charAt(0)?.toUpperCase() || 'U'}
		</AvatarFallback>
	</Avatar>

	<div class="flex flex-col gap-2">
		<Button variant="outline" size="sm" onclick={triggerFileSelect} disabled={isUploading}>
			{isUploading ? 'Uploading...' : 'Change Avatar'}
		</Button>

		{#if uploadSuccess}
			<p class="text-sm font-medium text-green-600">✓ Avatar updated successfully!</p>
		{/if}

		{#if uploadError}
			<p class="text-sm text-red-500">{uploadError}</p>
		{/if}
	</div>

	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		class="hidden"
		on:change={handleFileSelect}
	/>

	<!-- Confirmation Dialog -->
	<AlertDialog bind:open={showConfirmDialog}>
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>Update Avatar</AlertDialogTitle>
				<AlertDialogDescription>
					Are you sure you want to update your avatar? This will replace your current profile
					picture.
				</AlertDialogDescription>
			</AlertDialogHeader>

			{#if previewUrl}
				<div class="my-4 flex justify-center">
					<Avatar class="h-16 w-16">
						<AvatarImage src={previewUrl} alt="Preview" class="object-cover" />
						<AvatarFallback class="text-sm font-semibold">
							{username?.charAt(0)?.toUpperCase() || 'U'}
						</AvatarFallback>
					</Avatar>
				</div>
			{/if}

			<AlertDialogFooter>
				<AlertDialogCancel onclick={cancelUpload}>Cancel</AlertDialogCancel>
				<AlertDialogAction onclick={confirmUpload} disabled={isUploading}>
					{isUploading ? 'Uploading...' : 'Update Avatar'}
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
</div>
