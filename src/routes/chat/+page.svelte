<script lang="ts">
	import ChatContainer from '$lib/components/modules/chat/ChatContainer.svelte';

	// Props from parent layout
	let { data } = $props();
	let { session, supabase } = data;

	// Ensure session exists
	if (!session) {
		throw new Error('User must be logged in to view messages');
	}
</script>

<ChatContainer {session} {supabase} />
