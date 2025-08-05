<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { uploadAvatar, deleteAvatar } from '$lib/utils/supabase';
	import { getAvatarUrl } from '$lib/utils/user';
	import { toast } from 'svelte-sonner';

	const { supabase, userId, username, currentAvatarUrl } = $props();
	const dispatch = createEventDispatcher();
	let uploading = $state(false);
	let fileInput: HTMLInputElement;
	let currentAvatar = $state(currentAvatarUrl);

	const avatarDisplayUrl = $derived(getAvatarUrl(currentAvatar, username, supabase));

	async function compressImage(
		file: File,
		maxWidth = 400,
		maxHeight = 400,
		quality = 0.8
	): Promise<File> {
		return new Promise((resolve) => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d')!;
			const img = new Image();

			img.onload = () => {
				let { width, height } = img;
				if (width > height) {
					if (width > maxWidth) {
						height = (height * maxWidth) / width;
						width = maxWidth;
					}
				} else {
					if (height > maxHeight) {
						width = (width * maxHeight) / height;
						height = maxHeight;
					}
				}

				canvas.width = width;
				canvas.height = height;
				ctx.drawImage(img, 0, 0, width, height);
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
					quality
				);
			};

			img.src = URL.createObjectURL(file);
		});
	}

	async function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		if (!file.type.startsWith('image/')) {
			toast.error('Please select an image file');
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			toast.error('File size must be less than 5MB');
			return;
		}

		uploading = true;

		try {
			const compressedFile = await compressImage(file);
			const result = await uploadAvatar(supabase, compressedFile, userId);

			if (result) {
				toast.success('Avatar uploaded successfully');
				currentAvatar = result.path;
				dispatch('avatarUpdated', { avatarUrl: result.path });
			} else {
				toast.error('Failed to upload avatar');
			}
		} catch (error) {
			console.error('Upload error:', error);
			toast.error('Failed to upload avatar');
		} finally {
			uploading = false;
			if (fileInput) fileInput.value = '';
		}
	}

	async function handleRemoveAvatar() {
		if (!currentAvatar) return;

		uploading = true;

		try {
			const success = await deleteAvatar(supabase, userId, currentAvatar);

			if (success) {
				toast.success('Avatar removed successfully');
				currentAvatar = null;
				dispatch('avatarUpdated', { avatarUrl: null });
			} else {
				toast.error('Failed to remove avatar');
			}
		} catch (error) {
			console.error('Remove error:', error);
			toast.error('Failed to remove avatar');
		} finally {
			uploading = false;
		}
	}

	function handleClick() {
		fileInput?.click();
	}
</script>

<Card class="w-full max-w-sm">
	<CardContent class="p-6">
		<div class="flex flex-col items-center space-y-4">
			<div class="relative">
				<Avatar class="h-32 w-32 rounded-full ring-4 ring-gray-100">
					<AvatarImage src={avatarDisplayUrl} alt="Profile picture" class="object-cover" />
					<AvatarFallback class="text-lg font-semibold">
						{username ? username.charAt(0).toUpperCase() : 'U'}
					</AvatarFallback>
				</Avatar>
				{#if uploading}
					<div
						class="bg-opacity-50 absolute inset-0 flex items-center justify-center rounded-full bg-black"
					>
						<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
					</div>
				{/if}
			</div>

			<div class="flex w-full flex-col space-y-2">
				<input
					bind:this={fileInput}
					type="file"
					accept="image/*"
					class="hidden"
					onchange={handleFileSelect}
				/>

				<Button onclick={handleClick} disabled={uploading} variant="outline" class="w-full">
					{uploading ? 'Uploading...' : 'Upload New Picture'}
				</Button>

				{#if currentAvatar}
					<Button
						onclick={handleRemoveAvatar}
						disabled={uploading}
						variant="destructive"
						size="sm"
						class="w-full"
					>
						{uploading ? 'Removing...' : 'Remove Picture'}
					</Button>
				{/if}
			</div>

			<div class="text-center text-sm text-muted-foreground">
				<p>Upload a profile picture (JPG, PNG, GIF)</p>
				<p>Maximum file size: 5MB • Images will be compressed automatically</p>
			</div>
		</div>
	</CardContent>
</Card>
