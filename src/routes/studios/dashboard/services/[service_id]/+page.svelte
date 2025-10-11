<script lang="ts" module>
	import { z } from 'zod/v4';

	export const serviceSchema = z.object({
		id: z.string().optional(),
		name: z.string().min(1).max(100),
		price: z.number().positive(),
		description: z.string().max(1000).optional(),
		type: z.enum(['video', 'download', 'event', 'subscription']),
		highlights: z.array(z.string().min(1).max(100)).max(10),
		cover_url: z.string().max(255).optional()
	});

	export type ServiceSchema = typeof serviceSchema;
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import * as Form from '$lib/components/ui/form';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { handleServiceCoverUpload, updateService, deleteService } from '$lib/utils/services';
	import { goto } from '$app/navigation';
	import { getServiceCoverUrl } from '$lib/utils/storage';

	let { data } = $props();
	const { service, supabase, studio } = data;

	// Prepare initial form data from service
	// Ensure highlights is always an array of strings
	const serviceHighlights = Array.isArray(service?.highlights)
		? service.highlights
		: typeof service?.highlights === 'string'
			? JSON.parse(service.highlights)
			: [];

	// Handle description which might be Json type from database
	const serviceDescription = service?.description
		? typeof service.description === 'string'
			? service.description
			: JSON.stringify(service.description)
		: '';

	// Set default type to 'video' if creating new service, otherwise use existing type
	const serviceType = service?.type && service.type !== '' ? service.type : 'video';

	const initialFormData = {
		id: service?.id,
		name: service?.name || '',
		price: service?.price || 0,
		description: serviceDescription,
		type: serviceType,
		highlights: serviceHighlights || [],
		cover_url: service?.cover_url || null
	};

	const form = superForm(initialFormData, {
		validators: zod4Client(serviceSchema),
		validationMethod: 'oninput',
		dataType: 'json',
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'failure' && form.errors && Object.keys(form.errors).length) {
				requestAnimationFrame(() => {
					document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
				});
			}
		},
		onUpdated({ form }) {
			if (form.message) toast.success(form.message.text);
		}
	});

	const { form: formValues, enhance, submitting } = form;

	let coverPreview = $state('');
	let saveSuccess = $state(false);
	let newHighlight = $state('');

	const coverUrl = $derived(
		coverPreview ||
			($formValues.cover_url ? getServiceCoverUrl($formValues.cover_url, supabase) : null) ||
			(service?.cover_url ? getServiceCoverUrl(service.cover_url, supabase) : null)
	);

	function handleCoverFileSelect(event: Event) {
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

		handleServiceCoverUpload(supabase, file).then((filename) => {
			if (filename) {
				$formValues.cover_url = filename;
				coverPreview = getServiceCoverUrl(filename, supabase);
				toast.success('Cover image uploaded successfully');
			} else {
				toast.error('Failed to upload cover image');
			}
		});
	}

	function handleCoverRemove() {
		coverPreview = '';
		$formValues.cover_url = null;
	}

	function addHighlight() {
		if (newHighlight.trim() && $formValues.highlights.length < 10) {
			$formValues.highlights = [...$formValues.highlights, newHighlight.trim()];
			newHighlight = '';
		}
	}

	function removeHighlight(index: number) {
		$formValues.highlights = $formValues.highlights.filter((_: string, i: number) => i !== index);
	}

	async function handleSave() {
		const isValid = await form.validateForm();
		if (!isValid.valid) {
			requestAnimationFrame(() => {
				document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
			});
			return;
		}

		try {
			const serviceData = {
				name: $formValues.name,
				price: $formValues.price,
				description: $formValues.description,
				type: $formValues.type,
				highlights: $formValues.highlights,
				cover_url: $formValues.cover_url
			};

			if (service?.id) {
				// Update existing service
				const { success, error } = await updateService(
					supabase,
					studio.id,
					service.id,
					serviceData
				);
				if (success) {
					saveSuccess = true;
					toast.success('Service saved successfully!');
					// Reset success state after 2 seconds
					setTimeout(() => {
						saveSuccess = false;
					}, 2000);
				} else {
					toast.error(error || 'Failed to save service');
				}
			} else {
				// This shouldn't happen as we redirect for new services
				toast.error('Service ID not found');
			}
		} catch (error) {
			console.error('Error saving service:', error);
			toast.error('Failed to save service');
		}
	}

	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this service? This action cannot be undone.'))
			return;

		try {
			const { success, error } = await deleteService(supabase, studio.id, service.id);
			if (success) {
				toast.success('Service deleted successfully!');
				goto('/studios/dashboard/services');
			} else {
				toast.error(error || 'Failed to delete service');
			}
		} catch (error) {
			console.error('Error deleting service:', error);
			toast.error('Failed to delete service');
		}
	}
</script>

<svelte:head>
	<title>{service?.id ? 'Edit Service' : 'New Service'}</title>
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<Button variant="ghost" class="mb-6" href="/studios/dashboard/services">
		<ArrowLeft class="mr-2 h-4 w-4" /> Back to Services
	</Button>

	<h1 class="mb-6 text-3xl font-bold">{$formValues.id ? 'Edit Service' : 'New Service'}</h1>

	<form method="POST" use:enhance class="space-y-6">
		<!-- Basic Information -->
		<Card>
			<CardHeader>
				<h2 class="text-xl font-semibold">Basic Information</h2>
			</CardHeader>
			<CardContent class="space-y-4">
				<Form.Field {form} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Name</Form.Label>
							<Input {...props} bind:value={$formValues.name} placeholder="Service name" />
						{/snippet}
					</Form.Control>
				</Form.Field>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Form.Field {form} name="price">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Price ($)</Form.Label>
								<Input
									{...props}
									type="number"
									bind:value={$formValues.price}
									placeholder="0.00"
									min="0"
									step="0.01"
								/>
							{/snippet}
						</Form.Control>
					</Form.Field>

					<Form.Field {form} name="type">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Service Type</Form.Label>
								<select
									{...props}
									bind:value={$formValues.type}
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								>
									<option value="video">Video</option>
									<option value="download">Download</option>
									<option value="event">Event</option>
									<option value="subscription">Subscription</option>
								</select>
							{/snippet}
						</Form.Control>
					</Form.Field>
				</div>

				<Form.Field {form} name="description">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Description</Form.Label>
							<Textarea
								{...props}
								bind:value={$formValues.description}
								placeholder="Describe your service..."
								rows={4}
							/>
						{/snippet}
					</Form.Control>
				</Form.Field>
			</CardContent>
		</Card>

		<!-- Cover Image -->
		<Card>
			<CardHeader>
				<h2 class="text-xl font-semibold">Cover Image</h2>
			</CardHeader>
			<CardContent>
				<div class="mb-4 overflow-hidden rounded-lg">
					<div class="group relative">
						<button
							type="button"
							class="h-48 w-full cursor-pointer border-0 bg-transparent p-0 sm:h-64"
							onclick={() => document.getElementById('cover-input')?.click()}
							aria-label="Change cover image"
						>
							<div class="relative h-full w-full">
								{#if coverUrl}
									<img src={coverUrl} alt="" class="h-full w-full object-cover" />
								{:else}
									<div class="flex h-full w-full items-center justify-center bg-muted">
										<span class="text-muted-foreground">No cover image</span>
									</div>
								{/if}
								<div
									class="absolute inset-0 flex items-center justify-center opacity-50 transition-opacity hover:bg-gray-400"
								>
									<span class="text-lg font-medium text-white">Click to change cover image</span>
								</div>
							</div>
						</button>
						<Input
							type="file"
							id="cover-input"
							accept="image/*"
							onchange={handleCoverFileSelect}
							class="hidden"
						/>
						{#if $formValues.cover_url || coverPreview}
							<Button
								type="button"
								variant="outline"
								size="sm"
								onclick={handleCoverRemove}
								class="absolute top-2 right-2"
							>
								Remove Cover
							</Button>
						{/if}
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Highlights -->
		<Card>
			<CardHeader>
				<h2 class="text-xl font-semibold">Highlights</h2>
			</CardHeader>
			<CardContent>
				<div class="mb-4 flex gap-2">
					<Input
						bind:value={newHighlight}
						placeholder="Add a highlight..."
						onkeypress={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								addHighlight();
							}
						}}
					/>
					<Button type="button" onclick={addHighlight} disabled={!newHighlight.trim()}>Add</Button>
				</div>
				{#if $formValues.highlights.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each $formValues.highlights as highlight, i}
							<div class="flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
								<span class="text-sm">{highlight}</span>
								<button
									type="button"
									onclick={() => removeHighlight(i)}
									class="ml-1 text-muted-foreground hover:text-foreground"
									aria-label="Remove highlight"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<line x1="18" y1="6" x2="6" y2="18" />
										<line x1="6" y1="6" x2="18" y2="18" />
									</svg>
								</button>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">No highlights added yet</p>
				{/if}
				{#if $formValues.highlights.length >= 10}
					<p class="mt-2 text-sm text-muted-foreground">Maximum of 10 highlights reached</p>
				{/if}
			</CardContent>
		</Card>

		<!-- Actions -->
		<div class="flex justify-between">
			{#if $formValues.id}
				<Button type="button" variant="destructive" onclick={handleDelete} disabled={$submitting}>
					Delete Service
				</Button>
			{:else}
				<div></div>
			{/if}
			<div class="flex gap-2">
				<Button
					type="submit"
					onclick={handleSave}
					disabled={$submitting}
					variant={saveSuccess ? 'secondary' : 'default'}
				>
					{#if $submitting}
						Saving...
					{:else if saveSuccess}
						Saved!
					{:else}
						Save Service
					{/if}
				</Button>
			</div>
		</div>
	</form>
</div>
