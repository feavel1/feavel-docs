declare module '@editorjs/editorjs' {
	export default class EditorJS {
		constructor(config: any);
		isReady: Promise<void>;
		save(): Promise<any>;
		render(data: any): void;
		destroy(): void;
	}
}

declare module '@editorjs/header' {
	const Header: any;
	export default Header;
}

declare module '@editorjs/list' {
	const List: any;
	export default List;
}

declare module '@editorjs/quote' {
	const Quote: any;
	export default Quote;
}

declare module '@editorjs/code' {
	const CodeTool: any;
	export default CodeTool;
}

declare module '@editorjs/inline-code' {
	const InlineCode: any;
	export default InlineCode;
}

declare module '@editorjs/delimiter' {
	const Delimiter: any;
	export default Delimiter;
}

declare module '@editorjs/table' {
	const Table: any;
	export default Table;
}

declare module '@editorjs/simple-image' {
	const SimpleImage: any;
	export default SimpleImage;
}

declare module '@editorjs/checklist' {
	const Checklist: any;
	export default Checklist;
}

declare module '@editorjs/marker' {
	const Marker: any;
	export default Marker;
}

declare module 'editorjs-drag-drop' {
	const DragDrop: any;
	export default DragDrop;
}

declare module 'editorjs-undo' {
	const Undo: any;
	export default Undo;
}
