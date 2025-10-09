# Quickstart: Studio Services Dashboard Implementation

## Prerequisites

- SvelteKit 5 with TypeScript
- Supabase account and configured database
- shadcn-svelte components installed
- Project dependencies installed (`bun install`)

## Implementation Steps

### 1. Create the Studio Services Page Component

Create `/src/routes/studios/dashboard/services/+page.svelte` with the following structure:

```svelte
<script lang="ts">
	// Get data from parent layout
	let { data } = $props();
	let { isApproved, services } = data;
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Studio Services</h1>
	</div>

	{#if isApproved}
		<!-- Display services using existing Services component -->
		<Services {supabase} initialServices={services} />
	{:else}
		<!-- Display limited access message -->
		<Card>
			<CardHeader>
				<CardTitle>Services Management</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="rounded-md bg-yellow-50 p-4">
					<div class="flex">
						<div class="flex-shrink-0">
							<div class="h-5 w-5 text-yellow-400">⚠️</div>
						</div>
						<div class="ml-3">
							<h3 class="text-sm font-medium text-yellow-800">Limited Access</h3>
							<div class="mt-2 text-sm text-yellow-700">
								<p>
									Service management will be available after your studio application is approved.
								</p>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}
</div>
```

### 2. Update the Studio Dashboard Layout Server File

Modify `/src/routes/studios/dashboard/+layout.server.ts` to pass services data:

```ts
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, locals }) => {
	const { userProfile } = await parent();

	// Check if user has access to studio dashboard
	if (
		!userProfile?.studio ||
		(userProfile.studio.status !== 'applied' && userProfile.studio.status !== 'approved')
	) {
		// Redirect to member dashboard if user is not a studio
		redirect(303, '/member/dashboard');
	}

	const isApproved = userProfile.studio.status === 'approved';
	let services = [];

	// If approved, fetch studio services
	if (isApproved) {
		const { data, error } = await locals.supabase
			.from('services_v2')
			.select(
				`
        id,
        name,
        price,
        cover_url,
        highlights,
        service_type,
        status,
        created_at,
        created_by,
        studios!services_v2_created_by_fkey(name),
        services_category_rel(
          services_category!inner(category_name)
        )
      `
			)
			.eq('created_by', userProfile.studio.id)
			.order('created_at', { ascending: false });

		if (!error) {
			services = data || [];
		}
	}

	return {
		studio: userProfile.studio,
		isApproved,
		services
	};
};
```

### 3. Verify Integration with Existing Components

Ensure the existing Services component at `src/lib/components/modules/content/Services.svelte` can accept initial services data:

The component already supports an `initialServices` prop, so no changes should be needed.

### 4. Test the Implementation

1. Start the development server: `bun run dev`
2. Navigate to `/studios/dashboard/services` as an approved studio user
3. Verify services are displayed correctly using the existing Services component
4. Navigate to the same page as an applied studio user
5. Verify the limited access message is displayed
6. Test search and filtering functionality
7. Test pagination with multiple services

## Validation Checklist

### Functional Requirements

- [ ] Studio services page displays at /studios/dashboard/services
- [ ] Different content shown based on studio status ('approved' vs 'applied')
- [ ] Approved studios see their services using the existing Services component
- [ ] Applied studios see a limited access message
- [ ] Page follows the same code structure pattern as the /posts page
- [ ] Page properly integrates with the studio dashboard layout and navigation

### Technical Requirements

- [ ] Uses Svelte 5 runes for state management
- [ ] Uses `event.locals.supabase` for database operations
- [ ] Follows parent-child data flow with `await parent()`
- [ ] Accesses inherited data through props in Svelte components
- [ ] Maintains type safety with TypeScript
- [ ] Follows component-based architecture
- [ ] Meets performance and accessibility requirements

### Data Requirements

- [ ] Shows all services created by the studio (regardless of status)
- [ ] Includes search and filtering capabilities similar to public services page
- [ ] Uses same pagination as public services page (9 items per page)
- [ ] Shows basic info plus status indicators for each service

## Testing Scenarios

### Scenario 1: Approved Studio with Services

**Given** a user with 'approved' studio status and existing services
**When** they navigate to /studios/dashboard/services
**Then** they should see a list of their studio services using the existing Services component

### Scenario 2: Approved Studio with No Services

**Given** a user with 'approved' studio status and no services
**When** they navigate to /studios/dashboard/services
**Then** they should see an empty state message in the Services component

### Scenario 3: Applied Studio User

**Given** a user with 'applied' studio status
**When** they navigate to /studios/dashboard/services
**Then** they should see a limited access message explaining that service management will be available after approval

### Scenario 4: Non-Studio User

**Given** a user without studio status
**When** they try to access /studios/dashboard/services
**Then** they should be redirected to the member dashboard

### Scenario 5: Search and Filter Functionality

**Given** an approved studio user with services
**When** they use search and filtering on the services page
**Then** the services should be filtered according to their criteria

### Scenario 6: Pagination

**Given** an approved studio user with many services
**When** they navigate through pages of services
**Then** they should see 9 services per page as specified

## Post-Implementation Verification

1. Run type checking: `bun run check`
2. Run code formatting: `bun run format`
3. Verify all tests pass
4. Check for any console errors in the browser
5. Verify mobile responsiveness
6. Confirm accessibility standards are met
7. Validate performance with Lighthouse or similar tools
