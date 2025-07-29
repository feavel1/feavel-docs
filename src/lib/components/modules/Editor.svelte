<script lang="ts">
	import { onMount } from 'svelte';

	/**
	 * Editor component props
	 * @param {boolean} readOnly - Whether the editor is in read-only mode
	 * @param {string} class - Additional CSS classes
	 * @param {any} content - Initial content data for the editor
	 * @param {function} onChange - Callback function called when content changes
	 */
	let { readOnly = false, class: className = '', content = null, onChange } = $props();
	let editor: any = $state(null);
	let editorEl: HTMLElement;

	onMount(async () => {
		try {
			const { default: EditorJS } = await import('@editorjs/editorjs');
			const { default: Header } = await import('@editorjs/header');
			const { default: List } = await import('@editorjs/list');
			const { default: Quote } = await import('@editorjs/quote');
			const { default: CodeTool } = await import('@editorjs/code');
			const { default: InlineCode } = await import('@editorjs/inline-code');
			const { default: Delimiter } = await import('@editorjs/delimiter');
			const { default: Table } = await import('@editorjs/table');
			const { default: SimpleImage } = await import('@editorjs/simple-image');
			const { default: Checklist } = await import('@editorjs/checklist');
			const { default: Marker } = await import('@editorjs/marker');

			editor = new EditorJS({
				holder: editorEl,
				data: content,
				readOnly,
				tools: {
					header: Header,
					list: List,
					checklist: Checklist,
					quote: Quote,
					marker: Marker,
					code: CodeTool,
					delimiter: Delimiter,
					inlineCode: InlineCode,
					table: Table,
					image: SimpleImage
				},
				onChange: () => {
					if (onChange && editor) {
						editor.save().then((data: any) => {
							onChange(data);
						});
					}
				}
			});

			editor.isReady
				.then(() => {
					console.log('Editor.js is ready to work!');
				})
				.catch((reason: any) => {
					console.error(`Editor.js initialization failed:`, reason);
				});
		} catch (error) {
			console.error('Failed to load EditorJS:', error);
		}
	});
</script>

<div
	bind:this={editorEl}
	class="prose h-full w-full rounded-lg border select-none {className}"
></div>
