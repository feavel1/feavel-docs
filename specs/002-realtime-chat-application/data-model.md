# Data Model: Realtime Chat Application

**Feature**: Realtime Chat Application
**Date**: 2025-10-25
**Branch**: 002-realtime-chat-application

## Overview

The Realtime Chat Application uses the existing database schema with four main tables for chat functionality:

1. `chat_conversations` - Conversation containers
2. `chat_messages` - Individual messages within conversations
3. `chat_participants` - User membership in conversations
4. `chat_groups` - Group chat metadata linked to studios

## Entities

### ChatConversation

Represents a communication channel between two or more users.

**Fields**:

- `id` (string, primary key) - Unique identifier for the conversation
- `created_at` (timestamp) - When the conversation was created

**Relationships**:

- Has many ChatMessages (via `conversation_id`)
- Has many ChatParticipants (via `conversation_id`)
- Has one ChatGroup (via `conversation_id`)

### ChatMessage

Represents an individual message sent by a user within a conversation.

**Fields**:

- `id` (number, primary key) - Unique identifier for the message
- `conversation_id` (string, foreign key) - Reference to the conversation this message belongs to
- `message` (string) - The content of the message
- `sent_from` (string, foreign key) - Reference to the user who sent the message
- `created_at` (timestamp) - When the message was sent

**Relationships**:

- Belongs to ChatConversation (via `conversation_id`)
- Belongs to User (via `sent_from`)

### ChatParticipant

Represents the relationship between a user and a conversation.

**Fields**:

- `conversation_id` (string, foreign key) - Reference to the conversation
- `user_id` (string, foreign key) - Reference to the user

**Relationships**:

- Belongs to ChatConversation (via `conversation_id`)
- Belongs to User (via `user_id`)

### ChatGroup

Represents a group chat with additional metadata linked to a studio.

**Fields**:

- `id` (string, primary key) - Unique identifier for the group
- `conversation_id` (string, foreign key) - Reference to the conversation this group belongs to
- `name` (string) - Name of the group chat
- `description` (string) - Description of the group chat
- `created_by` (string, foreign key) - Reference to the studio that created the group
- `is_public` (boolean) - Whether the group is public (any user can join)
- `created_at` (timestamp) - When the group was created

**Relationships**:

- Belongs to ChatConversation (via `conversation_id`)
- Belongs to Studio (via `created_by`)

## Validation Rules

### ChatMessage

- `message`: Maximum 1000 characters (validated in sendMessage function)
- `sent_from`: Must match the authenticated user (enforced by RLS policies)
- `conversation_id`: Must reference an existing conversation where the user is a participant (enforced by RLS policies)

### ChatGroup

- `name`: Maximum 100 characters
- `description`: Maximum 500 characters
- `is_public`: Defaults to false if not specified

## State Transitions

### ChatConversation

- Created when: A new private conversation is initiated or a new group chat is created
- Deleted when: All participants leave and the conversation is empty (handled by application logic)

### ChatGroup

- Created when: A studio applies to the platform (automatically)
- Status changes: None (groups are either active or deleted)

### ChatParticipant

- Added when: A user joins a conversation (private invite or public group)
- Removed when: A user leaves a conversation

## Indexes and Performance Considerations

### Recommended Indexes

1. `chat_messages_conversation_id_idx` - For efficient message retrieval by conversation
2. `chat_participants_user_id_idx` - For efficient conversation lookup by user
3. `chat_participants_conversation_id_idx` - For efficient participant lookup by conversation
4. `chat_groups_conversation_id_idx` - For efficient group lookup by conversation
5. `chat_groups_created_by_idx` - For efficient group lookup by studio

### Pagination Strategy

- Message history: Paginated using `created_at` timestamp with limit of 50 messages per page
- Conversation list: Paginated with limit of 20 conversations per page

### Data Retention

- Chat messages: Automatically deleted after 1 year
- Other chat entities: Retained as long as referenced by active conversations

## Security Considerations

### Row Level Security (RLS) Policies

- Users can only view messages from conversations they're participants of
- Users can only send messages in conversations they're participants of
- Users can only view conversations they're participants of
- Users can only join public groups or conversations they've been invited to

### Data Access Patterns

- All database operations must use `event.locals.supabase` as per constitutional requirements
- Session validation handled at hook level, not in individual route files
- No new API routes needed as all operations are handled through existing UI components
