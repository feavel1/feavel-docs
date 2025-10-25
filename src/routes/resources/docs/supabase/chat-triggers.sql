-- Database triggers for Realtime Chat Application
-- This file contains the SQL commands to set up database triggers for broadcasting chat messages

-- Enable Realtime for the chat_messages table
-- This should be done in the Supabase dashboard or via the Supabase CLI
-- ALTER TABLE chat_messages REPLICA IDENTITY FULL;

-- Create a trigger function for broadcasting message changes
CREATE OR REPLACE FUNCTION broadcast_message_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Broadcast to conversation-specific channel
  PERFORM realtime.broadcast_changes(
    'chat:conversation:' || NEW.conversation_id::text,  -- topic
    TG_OP,                                              -- event
    TG_OP,                                              -- operation
    TG_TABLE_NAME,                                      -- table
    TG_TABLE_SCHEMA,                                    -- schema
    NEW,                                                -- new record
    OLD                                                 -- old record
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger function for broadcasting conversation changes
CREATE OR REPLACE FUNCTION broadcast_conversation_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Broadcast to user-specific channel for conversation list updates
  -- We'll broadcast to all participants of the conversation
  IF TG_OP = 'INSERT' THEN
    -- For new conversations, broadcast to all participants
    PERFORM realtime.broadcast_changes(
      'chat:user:' || participant.user_id::text || ':conversations',
      TG_OP,
      TG_OP,
      TG_TABLE_NAME,
      TG_TABLE_SCHEMA,
      NEW,
      OLD
    )
    FROM chat_participants participant
    WHERE participant.conversation_id = NEW.id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- For updated conversations, broadcast to all participants
    PERFORM realtime.broadcast_changes(
      'chat:user:' || participant.user_id::text || ':conversations',
      TG_OP,
      TG_OP,
      TG_TABLE_NAME,
      TG_TABLE_SCHEMA,
      NEW,
      OLD
    )
    FROM chat_participants participant
    WHERE participant.conversation_id = NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    -- For deleted conversations, broadcast to all participants
    PERFORM realtime.broadcast_changes(
      'chat:user:' || participant.user_id::text || ':conversations',
      TG_OP,
      TG_OP,
      TG_TABLE_NAME,
      TG_TABLE_SCHEMA,
      NEW,
      OLD
    )
    FROM chat_participants participant
    WHERE participant.conversation_id = OLD.id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger function for broadcasting participant changes
CREATE OR REPLACE FUNCTION broadcast_participant_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Broadcast to user-specific channel when participants are added/removed
  IF TG_OP = 'INSERT' THEN
    -- Notify the new participant about the conversation
    PERFORM realtime.broadcast_changes(
      'chat:user:' || NEW.user_id::text || ':conversations',
      'NEW_CONVERSATION',
      'INSERT',
      TG_TABLE_NAME,
      TG_TABLE_SCHEMA,
      NEW,
      OLD
    );

    -- Notify existing participants about the new participant
    PERFORM realtime.broadcast_changes(
      'chat:conversation:' || NEW.conversation_id::text,
      'PARTICIPANT_ADDED',
      'INSERT',
      TG_TABLE_NAME,
      TG_TABLE_SCHEMA,
      NEW,
      OLD
    )
    FROM chat_participants participant
    WHERE participant.conversation_id = NEW.conversation_id
    AND participant.user_id != NEW.user_id;

  ELSIF TG_OP = 'DELETE' THEN
    -- Notify the removed participant about the conversation removal
    PERFORM realtime.broadcast_changes(
      'chat:user:' || OLD.user_id::text || ':conversations',
      'CONVERSATION_REMOVED',
      'DELETE',
      TG_TABLE_NAME,
      TG_TABLE_SCHEMA,
      NEW,
      OLD
    );

    -- Notify remaining participants about the removed participant
    PERFORM realtime.broadcast_changes(
      'chat:conversation:' || OLD.conversation_id::text,
      'PARTICIPANT_REMOVED',
      'DELETE',
      TG_TABLE_NAME,
      TG_TABLE_SCHEMA,
      NEW,
      OLD
    )
    FROM chat_participants participant
    WHERE participant.conversation_id = OLD.conversation_id
    AND participant.user_id != OLD.user_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers on the chat_messages table
CREATE TRIGGER messages_broadcast_trigger
  AFTER INSERT OR UPDATE OR DELETE ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION broadcast_message_changes();

-- Create triggers on the chat_conversations table
CREATE TRIGGER conversations_broadcast_trigger
  AFTER INSERT OR UPDATE OR DELETE ON chat_conversations
  FOR EACH ROW EXECUTE FUNCTION broadcast_conversation_changes();

-- Create triggers on the chat_participants table
CREATE TRIGGER participants_broadcast_trigger
  AFTER INSERT OR DELETE ON chat_participants
  FOR EACH ROW EXECUTE FUNCTION broadcast_participant_changes();

-- Set up RLS policies for realtime.messages table to allow authenticated users
-- These policies are needed for Realtime Authorization

-- Allow authenticated users to receive broadcasts
CREATE POLICY "authenticated_users_can_receive" ON realtime.messages
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to send broadcasts
CREATE POLICY "authenticated_users_can_send" ON realtime.messages
  FOR INSERT TO authenticated WITH CHECK (true);