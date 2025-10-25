<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Switch } from '$lib/components/ui/switch';

	let {
		group = null,
		conversation = null,
		currentUser = null,
		onJoinGroup,
		onLeaveGroup,
		onCreateGroup
	} = $props();

	// State for creating new groups
	let isCreatingGroup = $state<boolean>(false);
	let groupName = $state<string>('');
	let groupDescription = $state<string>('');
	let isPublic = $state<boolean>(true);

	// Handle group creation
	async function handleCreateGroup() {
		if (!groupName.trim()) return;

		if (onCreateGroup) {
			await onCreateGroup({
				name: groupName,
				description: groupDescription,
				is_public: isPublic,
				participantIds: [currentUser.id] // Start with the creator
			});
		}

		// Reset form
		groupName = '';
		groupDescription = '';
		isPublic = true;
		isCreatingGroup = false;
	}
</script>

<Card class="w-full">
	<CardHeader>
		<CardTitle>Group Chat</CardTitle>
		<CardDescription>Manage your group chat settings</CardDescription>
	</CardHeader>

	<CardContent class="space-y-4">
		{#if group}
			<!-- Group exists, show details -->
			<div class="mb-4">
				<h3 class="font-semibold">{group.name}</h3>
				{#if group.description}
					<p class="mt-1 text-sm text-gray-600">{group.description}</p>
				{/if}
				<div class="mt-2 text-xs text-gray-500">
					Created by: {group.created_by}
					{#if group.is_public}
						| <span class="text-green-600">Public Group</span>{/if}
				</div>
			</div>

			{#if onLeaveGroup && conversation}
				<Button variant="outline" onclick={() => onLeaveGroup(conversation.id)}>Leave Group</Button>
			{/if}
		{:else}
			<!-- No group, show create option -->
			{#if !isCreatingGroup}
				<Button variant="outline" onclick={() => (isCreatingGroup = true)}>Create New Group</Button>
			{:else}
				<!-- Group creation form -->
				<div class="space-y-3">
					<div>
						<label for="groupName" class="text-sm font-medium">Group Name</label>
						<Input id="groupName" bind:value={groupName} placeholder="Enter group name" />
					</div>

					<div>
						<label for="groupDescription" class="text-sm font-medium">Description (Optional)</label>
						<Textarea
							id="groupDescription"
							bind:value={groupDescription}
							placeholder="Describe your group..."
						/>
					</div>

					<div class="flex items-center space-x-2">
						<Switch id="isPublic" bind:checked={isPublic} />
						<label for="isPublic" class="text-sm font-medium"> Make this group public </label>
					</div>

					<div class="flex space-x-2">
						<Button variant="outline" onclick={() => (isCreatingGroup = false)}>Cancel</Button>
						<Button onclick={handleCreateGroup} disabled={!groupName.trim()}>Create Group</Button>
					</div>
				</div>
			{/if}
		{/if}

		<!-- Join public groups section -->
		{#if onJoinGroup}
			<div class="border-t pt-4">
				<h3 class="mb-2 font-medium">Join Public Groups</h3>
				<Button
					variant="outline"
					onclick={() => {
						// This would typically open a modal or navigate to public groups page
						// For now, just calling a general join function
					}}
				>
					Browse Public Groups
				</Button>
			</div>
		{/if}
	</CardContent>
</Card>
