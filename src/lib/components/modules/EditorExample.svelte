<script lang="ts">
	import Editor from './Editor.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';

	let editorContent = $state(null);
	let isReadOnly = $state(false);
	let savedContent = $state(null);

	function handleContentChange(data: any) {
		editorContent = data;
		console.log('Content changed:', data);
	}

	function handleSave() {
		savedContent = editorContent;
		console.log('Content saved:', savedContent);
	}

	function handleToggleReadOnly() {
		isReadOnly = !isReadOnly;
	}
</script>

<Card class="mx-auto w-full max-w-4xl">
	<CardHeader>
		<CardTitle>Blog Editor</CardTitle>
		<div class="flex gap-2">
			<Button variant="default" onclick={handleSave}>Save Content</Button>
			<Button variant="outline" onclick={handleToggleReadOnly}>
				{isReadOnly ? 'Enable Editing' : 'Read Only'}
			</Button>
		</div>
	</CardHeader>
	<CardContent>
		<div class="h-96">
			<Editor
				readOnly={isReadOnly}
				content={savedContent}
				onChange={handleContentChange}
				class="min-h-full"
			/>
		</div>
	</CardContent>
</Card>

{#if savedContent}
	<Card class="mx-auto mt-4 w-full max-w-4xl">
		<CardHeader>
			<CardTitle>Saved Content (JSON)</CardTitle>
		</CardHeader>
		<CardContent>
			<pre class="overflow-auto rounded bg-muted p-4 text-xs">
				{JSON.stringify(savedContent, null, 2)}
			</pre>
		</CardContent>
	</Card>
{/if}
