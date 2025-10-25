# Chat Conversation Implementation

This document describes the implementation of the "Start Conversation" feature for user profiles.

## Files Created

1. **Database Function**: `src/lib/server/create_or_get_oneonone_conversation.sql`
   - SQL function that creates or retrieves an existing 1-on-1 conversation between two users
   - Ensures only one 1-on-1 conversation exists between any two users
   - Handles validation and security checks

2. **Client Utility**: `src/lib/utils/conversationUtils.ts`
   - TypeScript utility function to call the RPC function from the client
   - Provides error handling and type safety

3. **Updated Component**: `src/routes/member/[slug]/+page.svelte.updated`
   - Updated version of the member profile page with the "Message" button
   - Implements the conversation creation flow

## Implementation Details

### Database Function

The SQL function `create_or_get_oneonone_conversation` ensures that:

- Only one 1-on-1 conversation exists between any two users
- Proper validation is performed (no self-conversations, authenticated users only)
- Security is maintained through proper permission checks

### Client Implementation

The client-side implementation:

- Adds a "Message" button to user profiles (when viewing another user's profile)
- Handles loading states and error conditions
- Uses the RPC function to create or retrieve conversations
- Redirects to the chat interface with the appropriate conversation

## How to Deploy

1. **Database**: Execute the SQL in `src/lib/server/create_or_get_oneonone_conversation.sql` in your Supabase SQL editor

2. **Client Files**:
   - Copy `src/lib/utils/conversationUtils.ts` to your project
   - Update `src/routes/member/[slug]/+page.svelte` with the changes from `src/routes/member/[slug]/+page.svelte.updated`

## Usage

Once deployed, users will see a "Message" button on other users' profiles. Clicking this button will:

1. Check if a 1-on-1 conversation already exists between the users
2. Create a new conversation if one doesn't exist
3. Redirect to the chat interface with the appropriate conversation selected

## Future Migration to Remote Functions

This implementation is designed to be easily migrated to remote functions in the future:

1. The database function can remain as is
2. The client utility can be updated to use remote functions instead of direct RPC calls
3. The component implementation will require minimal changes
