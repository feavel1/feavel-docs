# Extended Chat Application Plan with Studio Group Chats

## Current State Analysis

The current chat implementation uses dummy data and lacks real-time functionality. The database schema is properly set up with:

- `chat_conversations` table for conversations
- `chat_messages` table for messages
- `chat_participants` table for conversation participants
- `chat_groups` table for group metadata with proper relationships to studios
- Studios system with `studios` table linked to users
- RLS policies already defined for security

## Updated Requirements

Based on your feedback, we'll extend the chat system to:

1. Keep 1-1 chats as they are
2. Automatically create group chats when a studio applies
3. Allow all users to join any studio group chat via a join button
4. Support large group chats (50+ participants)
5. Maintain basic messaging functionality only
6. Support high-scale performance requirements

## Recommended Approach

For your requirements, I recommend using **Supabase Broadcast** with **database triggers** for the following reasons:

1. **Broadcast** is more efficient for high-scale applications than Postgres Changes
2. **Database triggers** can automatically broadcast new messages to relevant channels
3. No presence tracking simplifies implementation
4. Better performance characteristics for your scale requirements

## Implementation Plan

### 1. Database Schema Updates

The `chat_groups` table already exists with the proper schema:

```sql
create table chat_groups (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references chat_conversations(id) on delete cascade,
  name varchar(100) not null,
  description text,
  created_by integer references studios(id),
  is_public boolean default false,
  created_at timestamp with time zone default now()
);
```

- Verify RLS policies for the existing tables
- Add any missing indexes for performance optimization

### 2. Automatic Group Chat Creation

- Modify the studio application process to automatically create a group chat
- When a user submits a studio application, create:
  - A new conversation in `chat_conversations`
  - A new group in `chat_groups` linked to the conversation
  - Add the studio applicant as the group creator
  - Set the group as public so all users can join

### 3. User Join Functionality

- Implement a "Join Group Chat" button for users
- Create function to add users to `chat_participants` table for group conversations
- Ensure all users can join any studio group chat
- Implement proper error handling for join operations

### 4. Supabase Realtime Channels

- Create private channels for 1-1 conversations using pattern: `chat:conversation:{conversation_id}`
- Create group channels for group chats: `chat:group:{group_id}`
- Create a public channel for the general chat: `chat:public:main`
- Implement proper channel cleanup to prevent resource leaks

### 5. Database Triggers

- Create triggers on `chat_messages` table to automatically broadcast new messages
- Use `realtime.broadcast_changes` for mirroring database changes efficiently
- Add triggers on `chat_groups` and `chat_participants` for group management events

### 6. Client-Side Implementation

- Replace dummy functions in `chatUtils.ts` with actual Supabase calls
- Implement real-time subscriptions in the chat components
- Add group chat creation functionality for studios (automatic on application)
- Add group chat joining/leaving functionality for users
- Add proper unsubscribe logic to prevent memory leaks
- Update UI to display both private chats and group chats distinctly

### 7. Studio-Specific Functionality

- Add server-side validation to ensure proper group chat creation on studio application
- Implement group management features (name, description updates)
- Add group deletion functionality (studio-only)

### 8. Security & Performance

- Use the existing RLS policies for security
- Extend RLS policies for the new tables if needed
- Implement message rate limiting on the server side
- Add pagination for message history in large groups
- Implement proper indexing for performance

## File Modifications Required

1. `src/lib/utils/chatUtils.ts` - Replace dummy implementations with real Supabase calls and add group functionality
2. `src/routes/chat/+page.svelte` - Add group chat UI and real-time subscription logic
3. `src/routes/studios/apply/+page.svelte` - Modify to automatically create group chats on application
4. Database triggers - Add SQL for broadcasting messages and group events
5. RLS policies - Extend security policies if needed

## Supabase Setup Required

1. Enable Realtime in Supabase dashboard
2. Run the RLS policies if not already applied
3. Create database triggers for message broadcasting
4. Create database triggers for group management events

## Key Benefits of This Approach

1. **Automation**: Group chats are automatically created when studios apply
2. **Accessibility**: All users can join any studio group chat with a simple click
3. **Scalability**: Broadcast is more efficient for large groups than Postgres Changes
4. **Flexibility**: Supports both 1-1 and group chats with a unified interface
5. **Security**: Leverages existing RLS policies and adds studio-specific controls
6. **Performance**: Proper indexing and pagination handle large groups efficiently
7. **Maintainability**: Simple schema design with minimal tables
8. **Database Design**: Clean one-to-one relationship between groups and conversations
