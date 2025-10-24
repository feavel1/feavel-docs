-- =============================================
-- Supabase RLS Policies for Chat Implementation
-- =============================================

-- This file contains Row Level Security policies for the chat system
-- Copy and paste these policies into your Supabase database editor

-- =============================================
-- 1. chat_messages table policies
-- =============================================

-- Enable RLS on chat_messages table
alter table chat_messages enable row level security;

-- Users can view messages from conversations they're participants of
create policy "Users can view conversation messages"
on chat_messages for select
using (
  conversation_id in (
    select conversation_id
    from chat_participants
    where user_id = (select auth.uid())
  )
);

-- Users can send messages in conversations they're participants of
-- and must be the actual sender
create policy "Users can send messages"
on chat_messages for insert
with check (
  conversation_id in (
    select conversation_id
    from chat_participants
    where user_id = (select auth.uid())
  )
  and sent_from = (select auth.uid())
);

-- Users can update their own messages (optional - implement with time restrictions if needed)
create policy "Users can update their own messages"
on chat_messages for update
using (
  sent_from = (select auth.uid())
)
with check (
  sent_from = (select auth.uid())
);

-- Users can delete their own messages (optional - implement with time restrictions if needed)
create policy "Users can delete their own messages"
on chat_messages for delete
using (
  sent_from = (select auth.uid())
);

-- =============================================
-- 2. chat_conversations table policies
-- =============================================

-- Enable RLS on chat_conversations table
alter table chat_conversations enable row level security;

-- Users can view conversations they're participants of
create policy "Users can view their conversations"
on chat_conversations for select
using (
  id in (
    select conversation_id
    from chat_participants
    where user_id = (select auth.uid())
  )
);

-- Users can create conversations (with proper validation on application side)
create policy "Users can create conversations"
on chat_conversations for insert
with check (
  auth.uid() is not null
);

-- Only admins can update or delete conversations (restrict as needed)
create policy "Admins can update conversations"
on chat_conversations for update
using (
  -- Replace with actual admin check logic
  false
);

create policy "Admins can delete conversations"
on chat_conversations for delete
using (
  -- Replace with actual admin check logic
  false
);

-- =============================================
-- 3. chat_participants table policies
-- =============================================

-- Enable RLS on chat_participants table
alter table chat_participants enable row level security;

-- Users can view participants of conversations they're part of
create policy "Users can view conversation participants"
on chat_participants for select
using (/
  conversation_id in (
    select conversation_id
    from chat_participants
    where user_id = (select auth.uid())
  )
);

-- Users can add themselves to conversations only with valid invitations
-- (This should be handled by application logic to validate invitations)
create policy "Users can join conversations"
on chat_participants for insert
with check (
  user_id = (select auth.uid())
  -- Additional validation should be done in application code
  -- to check for valid invitations or permissions
);

-- Users can remove themselves from conversations
create policy "Users can leave conversations"
on chat_participants for delete
using (
  user_id = (select auth.uid())
);

-- =============================================
-- Additional Security Considerations
-- =============================================

-- 1. Consider adding rate limiting at the application level
-- 2. Implement proper input validation and sanitization
-- 3. Add audit logging for security monitoring
-- 4. Consider time-based restrictions for message editing/deleting
-- 5. Implement proper error handling that doesn't expose system details

-- =============================================
-- To apply these policies:
-- 1. Copy this entire file
-- 2. Paste into Supabase SQL editor
-- 3. Run the query
-- =============================================