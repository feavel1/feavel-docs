import { command, query } from '$app/server';
import { z } from 'zod/v4';
import type { Tables } from '$lib/types/database.types';

// Simplified type exports
export type ChatConversation = Tables<'chat_conversations'>;
export type ChatMessage = Tables<'chat_messages'>;
export type ChatParticipant = Tables<'chat_participants'>;
export type ChatGroup = Tables<'chat_groups'>;

// Send a new message
export const sendMessage = command(
	z.object({
		conversation_id: z.string(),
		message: z.string().max(1000),
		sent_from: z.string()
	}),
	async ({ conversation_id, message, sent_from }) => {
		// Insert message into database
		// Note: In remote functions, we don't have direct access to event.locals.supabase
		// This is a limitation of the current remote functions implementation
		// For now, we'll need to use the utility functions that properly handle
		// the Supabase client through event.locals
		// Acknowledge parameters to avoid unused variable errors
		void conversation_id;
		void message;
		void sent_from;
		throw new Error('Not implemented in remote functions - use utility functions instead');
	}
);

// Get messages for a conversation
export const getConversationMessages = query(
	z.object({
		conversation_id: z.string(),
		limit: z.number().optional(),
		offset: z.number().optional()
	}),
	async ({ conversation_id, limit = 50, offset = 0 }) => {
		// Acknowledge parameters to avoid unused variable errors
		void conversation_id;
		void limit;
		void offset;
		throw new Error('Not implemented in remote functions - use utility functions instead');
	}
);

// Create a new conversation
export const createConversation = command(
	z.object({
		participant_ids: z.array(z.string())
	}),
	async ({ participant_ids }) => {
		// Acknowledge parameters to avoid unused variable errors
		void participant_ids;
		throw new Error('Not implemented in remote functions - use utility functions instead');
	}
);

// Get all conversations for a user
export const getUserConversations = query(z.string(), async (user_id) => {
	// Acknowledge parameters to avoid unused variable errors
	void user_id;
	throw new Error('Not implemented in remote functions - use utility functions instead');
});

// Create a new group chat
export const createGroupChat = command(
	z.object({
		name: z.string().max(100),
		description: z.string().max(500).optional(),
		is_public: z.boolean(),
		participant_ids: z.array(z.string())
	}),
	async ({ name, description, is_public, participant_ids }) => {
		// Acknowledge parameters to avoid unused variable errors
		void name;
		void description;
		void is_public;
		void participant_ids;
		throw new Error('Not implemented in remote functions - use utility functions instead');
	}
);

// Join a group chat
export const joinGroupChat = command(
	z.object({
		conversation_id: z.string()
	}),
	async ({ conversation_id }) => {
		// Acknowledge parameters to avoid unused variable errors
		void conversation_id;
		throw new Error('Not implemented in remote functions - use utility functions instead');
	}
);

// Get group information for a conversation
export const getGroupInfo = query(z.string(), async (conversation_id) => {
	// Acknowledge parameters to avoid unused variable errors
	void conversation_id;
	throw new Error('Not implemented in remote functions - use utility functions instead');
});

// Get all public group chats
export const getPublicGroupChats = query(async () => {
	throw new Error('Not implemented in remote functions - use utility functions instead');
});
