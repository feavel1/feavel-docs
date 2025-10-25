# Svelte .remote.ts Integration for Realtime Chat Application

**Feature**: Realtime Chat Application
**Date**: 2025-10-25
**Branch**: 002-realtime-chat-application

## Overview

This document specifies how Svelte's experimental .remote.ts capability will be integrated into the Realtime Chat Application to simplify client code by using remote functions for all server-side operations while maintaining real-time data fetching through Supabase subscriptions.

## Integration Approach

### Configuration

Enable Svelte's experimental remote functions in `svelte.config.js`:

```js
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    experimental: {
      remoteFunctions: true
    }
  },
  compilerOptions: {
    experimental: {
      async: true
    }
  }
};

export default config;
```

### Remote Functions Implementation

Create `src/lib/server/chat.remote.ts` with the following remote functions:

#### Message Operations

```ts
// src/lib/server/chat.remote.ts
import { command, query } from '$app/server';
import * as v from 'valibot';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Tables } from '$lib/types/database.types';

// Simplified type exports
export type ChatConversation = Tables<'chat_conversations'>;
export type ChatMessage = Tables<'chat_messages'>;
export type ChatParticipant = Tables<'chat_participants'>;
export type ChatGroup = Tables<'chat_groups'>;

// Send a new message
export const sendMessage = command(
  v.object({
    conversation_id: v.string(),
    message: v.pipe(v.string(), v.maxLength(1000)),
    sent_from: v.string()
  }),
  async ({ conversation_id, message, sent_from }) => {
    // Validate user session
    const user = await auth.getUser();
    if (!user || user.id !== sent_from) {
      throw error(401, 'Unauthorized');
    }

    // Insert message into database
    const { data: newMessage, error } = await db
      .from('chat_messages')
      .insert({
        conversation_id,
        message,
        sent_from
      })
      .select()
      .single();

    if (error) {
      throw error(500, 'Failed to send message');
    }

    // Broadcast message to conversation participants
    await realtime.broadcast_changes('chat_messages', newMessage);

    return newMessage as ChatMessage;
  }
);

// Get messages for a conversation
export const getConversationMessages = query(
  v.object({
    conversation_id: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number())
  }),
  async ({ conversation_id, limit = 50, offset = 0 }) => {
    const { data, error } = await db
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error(500, 'Failed to fetch messages');
    }

    return data as ChatMessage[];
  }
);
```

#### Conversation Management

```ts
// Create a new conversation
export const createConversation = command(
  v.object({
    participant_ids: v.array(v.string())
  }),
  async ({ participant_ids }) => {
    // Validate user session
    const user = await auth.getUser();
    if (!user) {
      throw error(401, 'Unauthorized');
    }

    // Validate participants
    if (participant_ids.length < 2) {
      throw error(400, 'A conversation must have at least 2 participants');
    }

    // Create new conversation
    const { data: newConversation, error: conversationError } = await db
      .from('chat_conversations')
      .insert({})
      .select()
      .single();

    if (conversationError) {
      throw error(500, 'Failed to create conversation');
    }

    // Add participants to the conversation
    const participantData = participant_ids.map((user_id) => ({
      conversation_id: newConversation.id,
      user_id
    }));

    const { error: participantsError } = await db
      .from('chat_participants')
      .insert(participantData);

    if (participantsError) {
      // Clean up conversation if participants creation fails
      await db.from('chat_conversations').delete().eq('id', newConversation.id);
      throw error(500, 'Failed to add participants to conversation');
    }

    return newConversation as ChatConversation;
  }
);

// Get all conversations for a user
export const getUserConversations = query(v.string(), async (user_id) => {
  const { data, error } = await db
    .from('chat_conversations')
    .select(`
      id,
      created_at,
      chat_participants(user_id),
      chat_groups(name, description, is_public)
    `)
    .eq('chat_participants.user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    throw error(500, 'Failed to fetch user conversations');
  }

  return data as ChatConversation[];
});
```

#### Group Operations

```ts
// Create a new group chat
export const createGroupChat = command(
  v.object({
    name: v.pipe(v.string(), v.maxLength(100)),
    description: v.optional(v.pipe(v.string(), v.maxLength(500))),
    is_public: v.boolean(),
    participant_ids: v.array(v.string())
  }),
  async ({ name, description, is_public, participant_ids }) => {
    // Validate user session
    const user = await auth.getUser();
    if (!user) {
      throw error(401, 'Unauthorized');
    }

    // Create new conversation
    const { data: newConversation, error: conversationError } = await db
      .from('chat_conversations')
      .insert({})
      .select()
      .single();

    if (conversationError) {
      throw error(500, 'Failed to create conversation');
    }

    // Create group
    const { data: newGroup, error: groupError } = await db
      .from('chat_groups')
      .insert({
        conversation_id: newConversation.id,
        name,
        description,
        created_by: user.id,
        is_public
      })
      .select()
      .single();

    if (groupError) {
      // Clean up conversation if group creation fails
      await db.from('chat_conversations').delete().eq('id', newConversation.id);
      throw error(500, 'Failed to create group');
    }

    // Add participants to the conversation
    const participantData = participant_ids.map((user_id) => ({
      conversation_id: newConversation.id,
      user_id
    }));

    const { error: participantsError } = await db
      .from('chat_participants')
      .insert(participantData);

    if (participantsError) {
      // Clean up conversation and group if participants creation fails
      await db.from('chat_groups').delete().eq('id', newGroup.id);
      await db.from('chat_conversations').delete().eq('id', newConversation.id);
      throw error(500, 'Failed to add participants to group');
    }

    return {
      conversation: newConversation as ChatConversation,
      group: newGroup as ChatGroup
    };
  }
);

// Join a group chat
export const joinGroupChat = command(
  v.object({
    conversation_id: v.string()
  }),
  async ({ conversation_id }) => {
    // Validate user session
    const user = await auth.getUser();
    if (!user) {
      throw error(401, 'Unauthorized');
    }

    const { error } = await db
      .from('chat_participants')
      .insert({
        conversation_id,
        user_id: user.id
      });

    if (error) {
      throw error(500, 'Failed to join group chat');
    }

    return { success: true };
  }
);

// Get group information for a conversation
export const getGroupInfo = query(v.string(), async (conversation_id) => {
  const { data, error } = await db
    .from('chat_groups')
    .select('*')
    .eq('conversation_id', conversation_id)
    .maybeSingle();

  if (error) {
    throw error(500, 'Failed to fetch group info');
  }

  return data as ChatGroup;
});

// Get all public group chats
export const getPublicGroupChats = query(async () => {
  const { data, error } = await db
    .from('chat_groups')
    .select(`
      *,
      chat_conversations(*)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw error(500, 'Failed to fetch public group chats');
  }

  return data as (ChatGroup & { conversation: ChatConversation })[];
});
```

## Client-Side Usage

### Message Operations

```svelte
<!-- In MessageInput.svelte -->
<script>
  import { sendMessage } from '$lib/server/chat.remote';
  import { subscribe } from '$lib/utils/chatUtils';

  let newMessageText = $state('');
  let isSending = $state(false);

  const handleSendMessage = async () => {
    if (!newMessageText.trim() || isSending) return;

    isSending = true;
    try {
      await sendMessage({
        conversation_id: $conversation.id,
        message: newMessageText,
        sent_from: $currentUser.id
      });
      newMessageText = '';
    } catch (error) {
      console.error('Failed to send message:', error);
      // Handle error (show notification, etc.)
    } finally {
      isSending = false;
    }
  };
</script>

<form onsubmit|preventDefault={handleSendMessage}>
  <input bind:value={newMessageText} placeholder="Type a message..." />
  <button disabled={isSending || !newMessageText.trim()}>
    {#if isSending}
      Sending...
    {:else}
      Send
    {/if}
  </button>
</form>
```

### Conversation Management

```svelte
<!-- In ConversationList.svelte -->
<script>
  import { getUserConversations, createConversation } from '$lib/server/chat.remote';
  import { subscribeToConversations } from '$lib/utils/chatUtils';

  let conversations = $state([]);
  let isLoading = $state(true);

  $effect(async () => {
    try {
      conversations = await getUserConversations($currentUser.id);
      isLoading = false;

      // Set up real-time subscription for new conversations
      const unsubscribe = subscribeToConversations(
        $supabase,
        $currentUser.id,
        (newConversation) => {
          conversations = [newConversation, ...conversations];
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to load conversations:', error);
      isLoading = false;
    }
  });

  const handleCreateConversation = async (participantIds) => {
    try {
      const newConversation = await createConversation({ participant_ids: participantIds });
      conversations = [newConversation, ...conversations];
    } catch (error) {
      console.error('Failed to create conversation:', error);
      // Handle error (show notification, etc.)
    }
  };
</script>
```

### Group Operations

```svelte
<!-- In GroupChatManager.svelte -->
<script>
  import { createGroupChat, joinGroupChat, getGroupInfo } from '$lib/server/chat.remote';
  import { getPublicGroupChats } from '$lib/server/chat.remote';

  let groups = $state([]);
  let isLoading = $state(true);

  $effect(async () => {
    try {
      groups = await getPublicGroupChats();
      isLoading = false;
    } catch (error) {
      console.error('Failed to load groups:', error);
      isLoading = false;
    }
  });

  const handleCreateGroup = async (groupData) => {
    try {
      const result = await createGroupChat({
        name: groupData.name,
        description: groupData.description,
        is_public: groupData.is_public,
        participant_ids: groupData.participantIds
      });

      groups = [result.group, ...groups];
    } catch (error) {
      console.error('Failed to create group:', error);
      // Handle error (show notification, etc.)
    }
  };

  const handleJoinGroup = async (conversationId) => {
    try {
      await joinGroupChat({ conversation_id: conversationId });
      // Refresh group info or update UI as needed
    } catch (error) {
      console.error('Failed to join group:', error);
      // Handle error (show notification, etc.)
    }
  };
</script>
```

## Benefits of Integration

### Simplified Client Code

1. **Type Safety**: Automatic validation of function arguments and return values
2. **Error Handling**: Built-in error handling with `<svelte:boundary>`
3. **Caching**: Automatic query caching while on page
4. **Less Boilerplate**: No need for manual API calls or form actions
5. **Consistent Patterns**: Unified approach for all server operations

### Server-Side Advantages

1. **Centralized Logic**: All server-side operations in one place
2. **Built-in Validation**: Automatic input validation with Valibot
3. **Security**: Session validation handled automatically
4. **Maintainability**: Easier to maintain and update server functions

## Implementation Plan

### Phase 1: Configuration and Setup
1. Update `svelte.config.js` to enable experimental remote functions
2. Install required dependencies (Valibot for validation)
3. Create the `chat.remote.ts` file with basic structure

### Phase 2: Message Operations
1. Implement `sendMessage` command with validation and broadcasting
2. Implement `getConversationMessages` query with pagination
3. Update client components to use remote functions

### Phase 3: Conversation Management
1. Implement `createConversation` command with participant validation
2. Implement `getUserConversations` query
3. Update conversation components to use remote functions

### Phase 4: Group Operations
1. Implement `createGroupChat` command with group creation
2. Implement `joinGroupChat` command for group participation
3. Implement `getGroupInfo` and `getPublicGroupChats` queries
4. Update group components to use remote functions

## Validation and Testing

### Type Safety
- All remote functions have proper TypeScript types
- Valibot schemas validate all inputs
- Return types are explicitly defined

### Error Handling
- Errors are properly caught and handled
- User-friendly error messages are provided
- Graceful degradation when operations fail

### Performance
- Queries are cached automatically
- Pagination is implemented for large datasets
- Real-time updates are efficient through Supabase channels

## Security Considerations

### Authentication
- All remote functions validate user sessions
- User permissions are checked before operations
- Unauthorized access attempts are properly rejected

### Data Validation
- All inputs are validated using Valibot schemas
- Message length limits are enforced
- Participant lists are validated

### Rate Limiting
- Message sending implements rate limiting
- Bulk operations are properly throttled
- Abuse prevention mechanisms are in place