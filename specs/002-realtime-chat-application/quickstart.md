# Quickstart Guide: Realtime Chat Application

**Feature**: Realtime Chat Application
**Date**: 2025-10-25
**Branch**: 002-realtime-chat-application

## Overview

This guide provides the steps to set up and test the Realtime Chat Application feature. The implementation uses Supabase Realtime Broadcast with database triggers for real-time message delivery, supports both private one-on-one conversations and group chats (up to 100 participants), and automatically creates group chats when studios apply to the platform. No new API routes are needed as the existing UI already handles different chats and conversations.

## Prerequisites

- Supabase project with Realtime enabled
- Database tables: `chat_conversations`, `chat_messages`, `chat_participants`, `chat_groups`
- RLS policies configured for chat tables
- Supabase client properly configured in the application
- Existing chat UI components in `src/lib/components/modules/chat/`

## Setup Steps

### 1. Database Setup
1. Ensure the following tables exist in your Supabase database:
   - `chat_conversations`
   - `chat_messages`
   - `chat_participants`
   - `chat_groups`
2. Enable Row Level Security (RLS) on all chat tables
3. Apply the chat RLS policies as defined in `src/routes/resources/docs/supabase/chat-rls-policies.sql`

### 2. Supabase Realtime Configuration
1. Enable Realtime in the Supabase dashboard
2. Configure the database triggers for message broadcasting
3. Set up proper authentication and authorization

### 3. Application Files
1. Update the chat utility functions in `src/lib/utils/chatUtils.ts` to use real Supabase implementations
2. Update the existing chat UI components in `src/lib/components/modules/chat/` to support real-time functionality
3. Update the main chat route in `src/routes/chat/+page.svelte` to use real-time subscriptions
4. Update the studio application process in `src/routes/studios/apply/+page.server.ts` to automatically create group chats

## Testing Steps

### 1. Private Chat Functionality
1. Log in as User A
2. Initiate a private conversation with User B using existing UI
3. Send a message to User B
4. Verify User B receives the message in real-time through existing UI
5. Confirm message history is preserved

### 2. Group Chat Functionality
1. Create or access an existing studio
2. Verify that a group chat was automatically created for the studio
3. Join the group chat as a different user using existing UI
4. Send messages in the group chat
5. Verify all participants receive messages in real-time through existing UI

### 3. Large Group Support
1. Create a group chat with multiple participants (test up to 100)
2. Send messages and verify delivery to all participants
3. Test performance with 50+ participants

### 4. Offline Message Handling
1. Send messages to a user who is offline
2. Have the user come online
3. Verify stored messages are delivered

### 5. Message Retention
1. Send messages in conversations
2. Verify messages are accessible for the retention period (1 year)
3. Confirm messages are deleted after the retention period

## Expected Behavior

- Messages are delivered in real-time using Supabase Broadcast through existing UI
- Users can create private conversations with any registered user using existing UI
- Group chats are automatically created when studios apply
- All users can join public studio group chats with a single click using existing UI
- Messages are stored for 1 year then deleted automatically
- Offline users receive messages when they come online
- Large group chats (up to 100 participants) perform well
- All constitutional requirements are met (type safety, component architecture, etc.)
- No new API routes are created

## Troubleshooting

### Common Issues
1. **Real-time messages not received**
   - Check Supabase Realtime service is enabled
   - Verify user is properly subscribed to channels
   - Confirm RLS policies allow access

2. **Studio group chats not created automatically**
   - Verify the studio application process calls the group creation function
   - Check database triggers for proper execution

3. **Performance issues in large groups**
   - Verify proper indexing is in place
   - Check for memory leaks in subscription handling
   - Review database query optimization

### Validation Commands
```bash
# Type checking
bun run check

# Code formatting
bun run format
```

## Success Criteria

- [ ] Private messages delivered in real-time between users through existing UI
- [ ] Group chats created automatically when studios apply
- [ ] Users can join public group chats with one click through existing UI
- [ ] Support for up to 100 participants in group chats
- [ ] Messages stored for 1 year and delivered to offline users
- [ ] All constitutional requirements met
- [ ] Performance acceptable with large group sizes
- [ ] No new API routes created