-- SQL function to create or get an existing 1-on-1 conversation between two users
-- This function ensures that only one 1-on-1 conversation exists between any two users
-- and returns the conversation ID for navigation to the chat interface

CREATE OR REPLACE FUNCTION create_or_get_oneonone_conversation(other_user_id UUID)
RETURNS UUID AS $$
DECLARE
  current_user_id UUID := auth.uid();
  conversation_id UUID;
BEGIN
  -- Validate input
  IF other_user_id IS NULL THEN
    RAISE EXCEPTION 'other_user_id cannot be null';
  END IF;

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  IF current_user_id = other_user_id THEN
    RAISE EXCEPTION 'Cannot create conversation with yourself';
  END IF;

  -- Find existing 1-on-1 conversation between these two users
  -- This query looks for conversations where exactly these two users are participants
  SELECT cc.id INTO conversation_id
  FROM chat_conversations cc
  WHERE EXISTS (
    -- Check that current user is a participant
    SELECT 1 FROM chat_participants cp1
    WHERE cp1.conversation_id = cc.id
    AND cp1.user_id = current_user_id
  )
  AND EXISTS (
    -- Check that other user is a participant
    SELECT 1 FROM chat_participants cp2
    WHERE cp2.conversation_id = cc.id
    AND cp2.user_id = other_user_id
  )
  AND NOT EXISTS (
    -- Ensure no other participants (exactly 2 participants total)
    SELECT 1 FROM chat_participants cp3
    WHERE cp3.conversation_id = cc.id
    AND cp3.user_id != current_user_id
    AND cp3.user_id != other_user_id
  )
  LIMIT 1;

  -- If no 1-on-1 conversation exists, create a new one
  IF conversation_id IS NULL THEN
    -- Create new conversation
    INSERT INTO chat_conversations DEFAULT VALUES
    RETURNING id INTO conversation_id;

    -- Add both users as participants
    INSERT INTO chat_participants (conversation_id, user_id)
    VALUES
      (conversation_id, current_user_id),
      (conversation_id, other_user_id);
  END IF;

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_or_get_oneonone_conversation(UUID) TO authenticated;