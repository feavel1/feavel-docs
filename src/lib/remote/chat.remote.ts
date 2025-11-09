import { command, query } from '$app/server';
import { z } from 'zod/v4';
import { supabase } from '$lib/server/supabase';
import type { Tables } from '$lib/types/database.types';

// Type exports
export type ChatConversation = Tables<'chat_conversations'> & {
	chat_participants?:
		| {
				user_id: string;
		  }[]
		| null;
	chat_groups?:
		| {
				name: string | null;
				description: string | null;
				is_public: boolean | null;
		  }[]
		| null;
};

export type ChatMessage = Tables<'chat_messages'>;

export type ChatParticipant = Tables<'chat_participants'>;

export type ChatGroup = Tables<'chat_groups'> & {
	chat_conversations?: {
		id: string;
	} | null;
};

/**
 * Get all conversations for a user with related data
 */
export const getUserConversations = query(z.string(), async (userId) => {
	try {
		const { data: conversations, error } = await supabase
			.from('chat_conversations')
			.select(
				`
				id,
				created_at,
				chat_participants(user_id),
				chat_groups(name, description, is_public)
			`
			)
			.eq('chat_participants.user_id', userId)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Database error in getUserConversations:', error);
			return [];
		}

		return conversations as unknown as ChatConversation[];
	} catch (error) {
		console.error('Unexpected error in getUserConversations:', error);
		return [];
	}
});

/**
 * Get messages for a conversation with pagination support
 */
export const getConversationMessages = query(
	z.object({
		conversationId: z.string(),
		limit: z.number().optional(),
		before: z.string().optional()
	}),
	async ({ conversationId, limit = 50, before }) => {
		try {
			let query = supabase
				.from('chat_messages')
				.select('*')
				.eq('conversation_id', conversationId)
				.order('created_at', { ascending: false })
				.limit(limit);

			// If before timestamp is provided, get messages older than that time
			if (before) {
				query = query.lt('created_at', before);
			}

			const { data: messages, error } = await query;

			if (error) {
				console.error('Database error in getConversationMessages:', error);
				return [];
			}

			// Reverse the order to show oldest first (for proper display)
			return messages.reverse() as ChatMessage[];
		} catch (error) {
			console.error('Unexpected error in getConversationMessages:', error);
			return [];
		}
	}
);

/**
 * Send a new message with database-based rate limiting
 */
export const sendMessage = command(
	z.object({
		conversation_id: z.string(),
		message: z.string().max(1000),
		sent_from: z.string()
	}),
	async ({ conversation_id, message, sent_from }) => {
		try {
			// Check rate limit using database query instead of in-memory store
			const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
			const { count, error: countError } = await supabase
				.from('chat_messages')
				.select('*', { count: 'exact', head: true })
				.eq('sent_from', sent_from)
				.gt('created_at', oneMinuteAgo);

			if (countError) {
				console.error('Rate limit check error:', countError);
				throw new Error('Failed to check rate limit');
			}

			// Max 10 messages per minute
			if (count && count >= 10) {
				throw new Error('Rate limit exceeded. Please wait before sending more messages.');
			}

			// Insert message into database
			const { data: newMessage, error } = await supabase
				.from('chat_messages')
				.insert({
					conversation_id,
					message,
					sent_from
				})
				.select()
				.single();

			if (error) {
				console.error('Database error in sendMessage:', error);
				return null;
			}

			return newMessage as ChatMessage;
		} catch (error) {
			console.error('Unexpected error in sendMessage:', error);
			throw error;
		}
	}
);

/**
 * Create a new group chat with participants
 */
export const createGroupChat = command(
	z.object({
		name: z.string().max(100),
		description: z.string().max(500).optional(),
		created_by: z.string(),
		is_public: z.boolean(),
		participantIds: z.array(z.string())
	}),
	async ({ name, description, created_by, is_public, participantIds }) => {
		try {
			// Create new conversation
			const { data: newConversation, error: conversationError } = await supabase
				.from('chat_conversations')
				.insert({})
				.select()
				.single();

			if (conversationError) {
				console.error('Error creating conversation:', conversationError);
				return null;
			}

			// Create group
			const { data: newGroup, error: groupError } = await supabase
				.from('chat_groups')
				.insert({
					conversation_id: newConversation.id,
					name,
					description: description || null,
					created_by,
					is_public
				})
				.select()
				.single();

			if (groupError) {
				console.error('Error creating group:', groupError);
				// Clean up conversation if group creation fails
				await supabase.from('chat_conversations').delete().eq('id', newConversation.id);
				return null;
			}

			// Add participants to the conversation
			const participantData = participantIds.map((userId) => ({
				conversation_id: newConversation.id,
				user_id: userId
			}));

			const { error: participantsError } = await supabase
				.from('chat_participants')
				.insert(participantData);

			if (participantsError) {
				console.error('Error adding participants:', participantsError);
				// Clean up conversation and group if participants creation fails
				await supabase.from('chat_groups').delete().eq('id', newGroup.id);
				await supabase.from('chat_conversations').delete().eq('id', newConversation.id);
				return null;
			}

			return {
				conversation: newConversation as ChatConversation,
				group: newGroup as ChatGroup
			};
		} catch (error) {
			console.error('Unexpected error in createGroupChat:', error);
			return null;
		}
	}
);

/**
 * Join a group chat
 */
export const joinGroupChat = command(
	z.object({
		conversationId: z.string(),
		userId: z.string()
	}),
	async ({ conversationId, userId }) => {
		try {
			const { error } = await supabase.from('chat_participants').insert({
				conversation_id: conversationId,
				user_id: userId
			});

			if (error) {
				console.error('Database error in joinGroupChat:', error);
				return false;
			}

			return true;
		} catch (error) {
			console.error('Unexpected error in joinGroupChat:', error);
			return false;
		}
	}
);

/**
 * Get group information for a conversation
 */
export const getGroupInfo = query(z.string(), async (conversationId) => {
	try {
		const { data: group, error } = await supabase
			.from('chat_groups')
			.select('*')
			.eq('conversation_id', conversationId)
			.maybeSingle();

		if (error) {
			console.error('Database error in getGroupInfo:', error);
			return null;
		}

		return group as ChatGroup;
	} catch (error) {
		console.error('Unexpected error in getGroupInfo:', error);
		return null;
	}
});

/**
 * Create or get an existing 1-on-1 conversation between the current user and another user
 * This function uses the RPC function defined in the database to ensure only one
 * 1-on-1 conversation exists between any two users.
 */
export const createOrGetOneOnOneConversation = command(z.string(), async (otherUserId) => {
	try {
		const { data, error } = await supabase.rpc('create_or_get_oneonone_conversation', {
			other_user_id: otherUserId
		});

		if (error) {
			throw new Error(`Failed to create or get conversation: ${error.message}`);
		}

		if (!data) {
			throw new Error('Failed to create or get conversation: No conversation ID returned');
		}

		return data;
	} catch (error) {
		console.error('Unexpected error in createOrGetOneOnOneConversation:', error);
		throw error;
	}
});

/**
 * Get all public group chats with related data
 */
export const getPublicGroups = query(async () => {
	try {
		const { data: groups, error } = await supabase
			.from('chat_groups')
			.select(
				`
				*,
				chat_conversations(*)
			`
			)
			.eq('is_public', true)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Database error in getPublicGroups:', error);
			return [];
		}

		return groups as (ChatGroup & { chat_conversations: ChatConversation })[];
	} catch (error) {
		console.error('Unexpected error in getPublicGroups:', error);
		return [];
	}
});
