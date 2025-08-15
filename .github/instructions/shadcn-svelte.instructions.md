---
description: UI/UX rules for shadcn-svelte usage in Feavel Docs
---

## General Rules

- Prefer existing components in `src/lib/components/ui/*`. Extend via composition rather than forking.
- Use Tailwind classes and component variants; avoid inline styles.
- Maintain accessibility: keep focus states, ARIA attributes, and keyboard interactions intact.
- Follow Svelte 5 event syntax (`onclick`, `onkeydown`, etc.).

## Imports

- Import from the component group barrel when available (e.g., `'$lib/components/ui/tooltip'`).

```svelte
<script>
	import Button from '$lib/components/ui/button/button.svelte';
	import { Tooltip, TooltipTrigger, TooltipContent } from '$lib/components/ui/tooltip';
</script>

<Tooltip>
	<TooltipTrigger>
		<Button size="sm">Hover me</Button>
	</TooltipTrigger>
	<TooltipContent>Helpful hint</TooltipContent>
</Tooltip>
```

## Patterns

- Composition first: wrap base components to add behavior; avoid modifying library source.
- Keep props minimal and typed; mirror existing component API patterns.
- Use feature modules under `src/lib/components/modules/*` for page-level compositions.

## Docs Lookup

- When unsure, consult the official docs (`https://www.shadcn-svelte.com/docs`). Use the documentation search tool to quickly find usage examples and API details.
