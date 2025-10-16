<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { FileStorage, ImageProcessor } from '$lib/services/storage';
	import { toast } from 'svelte-sonner';

	const { supabase, userId, username, currentAvatarUrl } = $props();
	let uploading = $state(false);
	let fileInput: HTMLInputElement;
	let currentAvatar = $state(currentAvatarUrl);
	let avatarDisplayUrl = $state('');
	let storage: FileStorage;

	// Initialize storage only once when supabase is available

	if (supabase) {
		storage = new FileStorage(supabase);
	}

	// Update avatar display URL when either currentAvatar
	// This effect will run initially and whenever currentAvatar changes due to reactivity
	$effect(() => {
		// We use an IIFE (immediately invoked function expression) for the async operation
		(async () => {
			if (currentAvatar) {
				const url = await storage.getUrl(currentAvatar);
				avatarDisplayUrl = url || '';
			} else if (currentAvatarUrl) {
				// Fallback to the original avatar URL
				avatarDisplayUrl = currentAvatarUrl;
			} else {
				avatarDisplayUrl = '';
			}
		})();
	});

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
			// Image compression using the new ImageProcessor service
			const compressedFile = await ImageProcessor.compressImage(file, 400, 400, 0.8);

			if (storage) {
				const result = await storage.upload({
					file: compressedFile,
					options: {
						folder: 'users/avatars',
						entity_type: 'user',
						entity_id: userId,
						is_public: true,
						upsert: true
					}
				});

				if (result) {
					// Update user profile to set avatar_file_id to the storage ID
					const { error } = await supabase
						.from('users')
						.update({ avatar_file_id: result.storage_id })
						.eq('id', userId);

					if (error) {
						console.error('Failed to update avatar_file_id in database:', error.message);
						// Still use the storage ID as the avatar reference but show an error message
						currentAvatar = result.storage_id;
						toast.error('Avatar uploaded but database update failed');
					} else {
						toast.success('Avatar uploaded successfully');
						// Use the storage ID as the avatar reference
						currentAvatar = result.storage_id;
					}
				} else {
					toast.error('Failed to upload avatar');
				}
			} else {
				toast.error('Storage not initialized');
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
			if (storage) {
				const success = await storage.delete(currentAvatar);

				if (success) {
					// Update user profile to clear avatar_file_id reference
					const { error } = await supabase
						.from('users')
						.update({ avatar_file_id: null })
						.eq('id', userId);

					if (error) {
						console.error('Failed to clear avatar_file_id in database:', error.message);
						// Still proceed with UI update if file deletion succeeded
					}

					toast.success('Avatar removed successfully');
					currentAvatar = null;
				} else {
					toast.error('Failed to remove avatar');
				}
			} else {
				toast.error('Storage not initialized');
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
