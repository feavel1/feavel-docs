/posts/[post_id] code simplification plan.

Plan to Simplify PostEditor with Superforms and Click-to-Edit

Analysis Summary

Based on your requirements, I can reduce the code significantly by:

1. Moving logic to +page.server.ts with Superforms and Zod validation
2. Implementing click-to-edit functionality with minimal JavaScript
3. Using the same form framework approach as in settings
4. Removing separate edit mode and edit button
5. Keeping JavaScript minimal (only for Editor.js)

Implementation Approach

1. Schema Definition (+page.svelte module script)

### Schema Definition (in +page.svelte module script)

```ts
import { z } from 'zod';

export const settingsSchema = z.object({
	full_name: z.string().max(100).nullable(),
	description: z.string().max(500).nullable(),
	birthday: z.string().or(z.literal('')).nullable()
});

export type SettingsSchema = typeof settingsSchema;
```

### Server-side Loading (+page.server.ts)

```ts
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { settingsSchema } from './+page.svelte';

export const load = async ({ parent }) => {
	const { session, userProfile } = await parent();

	const formData = {
		full_name: userProfile?.full_name ?? null,
		description: userProfile?.description ?? null,
		birthday: userProfile?.birthday ?? null
	};

	return {
		userProfile,
		session,
		form: await superValidate(formData, zod(settingsSchema))
	};
};
```

### Client-side Implementation (+page.svelte)

```svelte
<script>
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { settingsSchema } from './+page.svelte';

	const { data } = $props();
	const { form: formData } = data;

	const form = superForm(formData, {
		validators: zodClient(settingsSchema),
		resetForm: false,
		onResult: () => {
			// Focus on first error
			if (form.errors && Object.keys(form.errors).length) {
				requestAnimationFrame(() => {
					document.querySelector < HTMLElement > '[aria-invalid="true"]'?.focus();
				});
			}
		},
		onUpdated({ form }) {
			if (form.message) {
				toast.success(form.message.text);
			}
		}
	});

	const { form: formValues, enhance, submitting, message } = form;
</script>

<form method="POST" use:enhance>
	<input bind:value={$formValues.full_name} />
	<!-- Form fields -->
	<button disabled={$submitting}
		>{#if $submitting}
			Saving...
		{:else}
			Save Changes
		{/if}</button
	>
</form>
```

2. Server Actions (+page.server.ts)

- Move all post creation/update logic to form actions
- Use Superforms for validation and error handling
- Handle file uploads in server actions

3. Client Implementation (+page.svelte)

- Use single form with use:enhance for progressive enhancement
- Implement click-to-edit directly on content elements
- Remove separate edit state and handler functions
- Use Form.Field components for structured form handling

4. Simplified PostEditor Component

- Remove all edit/view mode logic
- Make fields directly editable based on author status
- Simplify prop interface
- Use form context instead of prop drilling

Key Benefits

1. Less Code: Eliminates duplicate state management and handler functions
2. Better UX: Direct click-to-edit without separate edit mode
3. Type Safety: Zod validation ensures data integrity
4. Progressive Enhancement: Works with JavaScript but enhances UX when available
5. Consistency: Uses same patterns as other forms in the application

Implementation Steps

1. Define Zod schema for post data
2. Create server actions for post CRUD operations
3. Implement form in +page.svelte with Superforms
4. Simplify PostEditor component
5. Add click-to-edit functionality with minimal JavaScript
6. Update utility functions to work with form actions
7. Test and validate the new implementation
