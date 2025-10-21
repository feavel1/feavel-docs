<script lang="ts">
	import { onMount } from 'svelte';
	import { uploadAttachesFile } from '$lib/utils/editor';

	let {
		readOnly = false,
		class: className = '',
		content = null,
		onChange,
		postId,
		supabase
	} = $props();
	let editor: any = $state(null);
	let editorEl: HTMLElement;

	onMount(async () => {
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
		const { default: Attaches } = await import('@editorjs/attaches');
		const { default: Embed } = await import('@editorjs/embed');
		const { default: Link } = await import('@editorjs/link');
		const { default: Warning } = await import('@editorjs/warning');
		const { default: ColorPicker } = await import('editorjs-color-picker');
		const { default: DragDrop } = await import('editorjs-drag-drop');
		const { default: Undo } = await import('editorjs-undo');
		// const { default: MultiblockSelection } = await import('editorjs-multiblock-selection-plugin');

		editor = new EditorJS({
			holder: editorEl,
			data: content,
			readOnly,
			tools: {
				header: {
					class: Header,
					config: {
						placeholder: 'Enter a header',
						levels: [1],
						defaultLevel: 1
					}
				},
				list: List,
				checklist: Checklist,
				quote: Quote,
				marker: Marker,
				code: CodeTool,
				delimiter: Delimiter,
				inlineCode: InlineCode,
				table: Table,
				image: SimpleImage,
				attaches: {
					class: Attaches,
					config: {
						uploader: {
							uploadByFile: async (file: File) => {
								if (!supabase || !postId) {
									throw new Error('Supabase client and postId are required for file uploads');
								}
								const result = await uploadAttachesFile(supabase, file, postId);
								if (!result) {
									throw new Error('File upload failed');
								}
								return {
									success: 1,
									file: result
								};
							}
						}
					}
				},
				embed: Embed,
				link: Link,
				warning: Warning,
				color: ColorPicker
			},
			onReady: () => {
				new Undo({ editor });
				new DragDrop(editor);
				// new MultiblockSelection();
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
	});
</script>

<div bind:this={editorEl} class="prose rounded-lg border {className}"></div>
