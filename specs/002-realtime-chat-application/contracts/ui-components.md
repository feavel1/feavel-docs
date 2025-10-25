# UI Components Specification: Realtime Chat Application

**Feature**: Realtime Chat Application
**Date**: 2025-10-25
**Branch**: 002-realtime-chat-application

## Overview

This document specifies the UI components for the Realtime Chat Application. Since no new API routes are needed, the focus is on enhancing existing UI components with real-time functionality.

## Component Hierarchy

```
ChatContainer.svelte
├── ConversationList.svelte
│   ├── ConversationItem.svelte
│   └── NewConversationButton.svelte
├── ChatWindow.svelte
│   ├── MessageList.svelte
│   │   ├── MessageItem.svelte
│   │   └── MessageSkeleton.svelte
│   ├── MessageInput.svelte
│   └── ChatHeader.svelte
├── GroupChatManager.svelte
│   ├── GroupInfo.svelte
│   ├── GroupMembers.svelte
│   └── JoinGroupButton.svelte
└── ChatNotifications.svelte
```

## Core Components

### ChatContainer.svelte

**Purpose**: Main container component that manages chat state and coordinates between sub-components.

**Props**:
- `session` (Session object) - Current user session
- `userProfile` (UserProfile object) - Current user profile

**State**:
- `conversations` (ChatConversation[]) - List of user's conversations
- `activeConversation` (ChatConversation) - Currently selected conversation
- `messages` (ChatMessage[]) - Messages for active conversation
- `isLoading` (boolean) - Loading state for data fetching

**Functions**:
- `loadConversations()` - Fetch user's conversations
- `selectConversation(conversationId)` - Set active conversation
- `sendMessage(messageText)` - Send a new message
- `createConversation(participantIds)` - Create new conversation
- `subscribeToUpdates()` - Set up real-time subscriptions

### ConversationList.svelte

**Purpose**: Displays list of user's conversations with ability to select and create new ones.

**Props**:
- `conversations` (ChatConversation[]) - List of conversations to display
- `activeConversationId` (string) - ID of currently selected conversation
- `onSelect` (function) - Callback when conversation is selected
- `onCreate` (function) - Callback when new conversation is requested

**State**:
- `searchTerm` (string) - Filter term for conversations

### ChatWindow.svelte

**Purpose**: Main chat interface for a selected conversation.

**Props**:
- `conversation` (ChatConversation) - Current conversation
- `messages` (ChatMessage[]) - Messages to display
- `currentUser` (User) - Current authenticated user
- `onSendMessage` (function) - Callback to send a message
- `onLoadMore` (function) - Callback to load more messages

**State**:
- `newMessageText` (string) - Text for new message being composed
- `isSending` (boolean) - Sending state

### MessageList.svelte

**Purpose**: Displays messages in a conversation with proper scrolling and loading.

**Props**:
- `messages` (ChatMessage[]) - Messages to display
- `currentUser` (User) - Current authenticated user
- `onLoadMore` (function) - Callback to load more messages
- `isLoadingMore` (boolean) - Loading state for more messages

**State**:
- `scrollTop` (number) - Current scroll position
- `shouldAutoScroll` (boolean) - Whether to auto-scroll to new messages

### GroupChatManager.svelte

**Purpose**: Manages group chat functionality including creation, joining, and member management.

**Props**:
- `group` (ChatGroup) - Current group information
- `conversation` (ChatConversation) - Associated conversation
- `currentUser` (User) - Current authenticated user
- `onJoinGroup` (function) - Callback to join a group
- `onLeaveGroup` (function) - Callback to leave a group

## Integration Points

### Existing UI Components to Enhance

1. **src/lib/components/modules/chat/ChatContainer.svelte**
   - Add real-time subscription management
   - Integrate with Supabase Broadcast channels
   - Implement automatic message delivery to offline users

2. **src/lib/components/modules/chat/ConversationList.svelte**
   - Add real-time updates for new conversations
   - Implement group chat joining functionality

3. **src/lib/components/modules/chat/MessageList.svelte**
   - Add real-time message updates
   - Implement proper scroll management for new messages

4. **src/routes/chat/+page.svelte**
   - Update to use real Supabase implementations
   - Add proper cleanup for real-time subscriptions

### Utility Functions Integration

1. **src/lib/utils/chatUtils.ts**
   - Replace dummy implementations with real Supabase calls
   - Add real-time subscription functions
   - Implement proper error handling

### Studio Application Integration

1. **src/routes/studios/apply/+page.server.ts**
   - Add automatic group chat creation logic
   - Integrate with existing studio application flow

## Data Flow

1. **Initialization**:
   - ChatContainer loads user conversations on mount
   - Sets up real-time subscriptions for conversation updates
   - Loads messages for active conversation

2. **Real-time Updates**:
   - New messages broadcast through Supabase channels
   - UI components receive updates via subscription callbacks
   - Message list automatically scrolls to new messages

3. **User Actions**:
   - Message input triggers sendMessage function
   - Function validates and sends to Supabase
   - Real-time broadcast notifies other participants
   - UI updates with confirmation

4. **Cleanup**:
   - Component unmount triggers subscription cleanup
   - Resources properly released to prevent memory leaks

## Styling and Accessibility

### CSS Classes
- All components should use existing Tailwind classes
- Follow established design system patterns
- Maintain consistency with current UI theme

### Accessibility Features
- Proper ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Focus management for dynamic content

## Performance Considerations

### Virtualization
- MessageList should implement virtual scrolling for large message histories
- ConversationList should virtualize long lists

### Memoization
- Components should memoize expensive calculations
- Use Svelte 5 runes for efficient state management

### Lazy Loading
- Messages should be paginated and loaded on demand
- Conversation details loaded only when needed

## Error Handling

### Network Errors
- Display appropriate error messages for connection issues
- Implement retry mechanisms for failed operations
- Gracefully handle offline scenarios

### Validation Errors
- Validate message content before sending
- Display user-friendly validation messages
- Prevent sending of invalid data

### Permission Errors
- Handle RLS policy violations gracefully
- Display appropriate messages for unauthorized actions
- Redirect or disable actions when permissions are insufficient