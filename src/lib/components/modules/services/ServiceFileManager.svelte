<script lang="ts">
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import PreviewFileUpload from '$lib/components/modules/services/PreviewFileUpload.svelte';
	import ProductFileUpload from '$lib/components/modules/services/ProductFileUpload.svelte';

	const { supabase, serviceId } = $props();
</script>

<Card>
	<CardHeader>
		<CardTitle>File Management</CardTitle>
	</CardHeader>
	<CardContent>
		<Tabs value="preview" class="w-full">
			<TabsList class="grid w-full grid-cols-2">
				<TabsTrigger value="preview">Preview File</TabsTrigger>
				<TabsTrigger value="product">Product File</TabsTrigger>
			</TabsList>
			<TabsContent value="preview" class="pt-4">
				<PreviewFileUpload {supabase} {serviceId} />
			</TabsContent>
			<TabsContent value="product" class="pt-4">
				<ProductFileUpload {supabase} {serviceId} />
			</TabsContent>
		</Tabs>
	</CardContent>
</Card>
