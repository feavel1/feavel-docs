import type { SupabaseClient } from '@supabase/supabase-js';
import type { Tables } from '$lib/types/database.types';

// Simplified type exports
export type ChatConversation = Tables<'chat_conversations'>;
export type ChatMessage = Tables<'chat_messages'>;
export type ChatParticipant = Tables<'chat_participants'>;
export type ChatGroup = Tables<'chat_groups'>;

/**
 * Get all conversations for a user
 */
export const getUserConversations = async (
	supabase: SupabaseClient,
	userId: string
): Promise<ChatConversation[]> => {
	const { data, error } = await supabase
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
		console.error('Error fetching user conversations:', error);
		return [];
	}

	return data as ChatConversation[];
};

/**
 * Get messages for a conversation with pagination support
 */
export const getConversationMessages = async (
	supabase: SupabaseClient,
	conversationId: string,
	options: {
		limit?: number;
		before?: string; // ISO timestamp
	} = {}
): Promise<ChatMessage[]> => {
	const { limit = 50, before } = options;

	let query = supabase
		.from('chat_messages')
		.select('*')
		.eq('conversation_id', conversationId)
		.order('created_at', { ascending: true })
		.limit(limit);

	// If before timestamp is provided, get messages before that time
	if (before) {
		query = query.lt('created_at', before);
	}

	const { data, error } = await query;

	if (error) {
		console.error('Error fetching conversation messages:', error);
		return [];
	}

	return data as ChatMessage[];
};

/**
 * Get older messages for pagination
 */
export const getOlderMessages = async (
	supabase: SupabaseClient,
	conversationId: string,
	beforeTimestamp: string,
	limit: number = 50
): Promise<ChatMessage[]> => {
	const { data, error } = await supabase
		.from('chat_messages')
		.select('*')
		.eq('conversation_id', conversationId)
		.lt('created_at', beforeTimestamp)
		.order('created_at', { ascending: false })
		.limit(limit)
		.then((result) => {
			// Reverse the order to show oldest first
			if (result.data) {
				result.data.reverse();
			}
			return result;
		});

	if (error) {
		console.error('Error fetching older messages:', error);
		return [];
	}

	return data as ChatMessage[];
};

// Simple in-memory rate limiting store
const messageRateLimitStore = new Map<string, { count: number; lastReset: number }>();

/**
 * Check if a user has exceeded the rate limit
 */
function checkRateLimit(userId: string): boolean {
	const now = Date.now();
	const windowMs = 60000; // 1 minute window
	const maxMessages = 10; // Max 10 messages per minute

	let userLimit = messageRateLimitStore.get(userId);

	// Reset counter if window has passed
	if (!userLimit || now - userLimit.lastReset > windowMs) {
		userLimit = { count: 0, lastReset: now };
		messageRateLimitStore.set(userId, userLimit);
	}

	// Check if limit exceeded
	if (userLimit.count >= maxMessages) {
		return false; // Rate limit exceeded
	}

	// Increment counter
	userLimit.count++;
	messageRateLimitStore.set(userId, userLimit);

	return true; // Within rate limit
}

/**
 * Send a new message
 *
 * SERVER-SIDE: This function must always run on the server for security
 * VALIDATION: Input sanitization required
 * VALIDATION: Length validation required
 * RATE LIMIT: Implement message rate limiting to prevent spam
 */
export const sendMessage = async (
	supabase: SupabaseClient,
	data: {
		conversation_id: string;
		message: string;
		sent_from: string;
	}
): Promise<ChatMessage | null> => {
	// Validate message length
	if (data.message.length > 1000) {
		throw new Error('Message too long. Maximum 1000 characters allowed.');
	}

	// Check rate limit
	if (!checkRateLimit(data.sent_from)) {
		throw new Error('Rate limit exceeded. Please wait before sending more messages.');
	}

	// Insert message into database
	const { data: newMessage, error } = await supabase
		.from('chat_messages')
		.insert({
			conversation_id: data.conversation_id,
			message: data.message,
			sent_from: data.sent_from
		})
		.select()
		.single();

	if (error) {
		console.error('Error sending message:', error);
		return null;
	}

	return newMessage as ChatMessage;
};

/**
 * Create a new conversation
 *
 * SERVER-SIDE: This function must always run on the server for security
 * VALIDATION: Participant validation required
 */
export const createConversation = async (
	supabase: SupabaseClient,
	participantIds: string[]
): Promise<ChatConversation> => {
	// Validate participants
	if (participantIds.length < 2) {
		throw new Error('A conversation must have at least 2 participants');
	}

	// Create new conversation
	const { data: newConversation, error: conversationError } = await supabase
		.from('chat_conversations')
		.insert({})
		.select()
		.single();

	if (conversationError) {
		console.error('Error creating conversation:', conversationError);
		throw new Error('Failed to create conversation');
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
		throw new Error('Failed to add participants to conversation');
	}

	return newConversation as ChatConversation;
};

/**
 * Subscribe to real-time message updates
 */
export const subscribeToMessages = async (
	supabase: SupabaseClient,
	conversationId: string,
	callback: (message: ChatMessage) => void
): Promise<() => void> => {
	// Create a channel for this conversation
	const channel = supabase
		.channel(`chat:conversation:${conversationId}`)
		.on('broadcast', { event: 'new_message' }, (payload) => {
			callback(payload.payload.message as ChatMessage);
		})
		.subscribe();

	// Return unsubscribe function
	return () => {
		supabase.removeChannel(channel).catch(console.error);
	};
};

/**
 * Subscribe to real-time conversation updates
 */
export const subscribeToConversations = async (
	supabase: SupabaseClient,
	userId: string,
	callback: (conversation: ChatConversation) => void
): Promise<() => void> => {
	// Create a channel for this user's conversations
	const channel = supabase
		.channel(`chat:user:${userId}:conversations`)
		.on('broadcast', { event: 'new_conversation' }, (payload) => {
			callback(payload.payload.conversation as ChatConversation);
		})
		.subscribe();

	// Return unsubscribe function
	return () => {
		supabase.removeChannel(channel).catch(console.error);
	};
};

/**
 * Unsubscribe from a channel
 */
export const unsubscribe = async (supabase: SupabaseClient, channel: any): Promise<void> => {
	// Unsubscribe from Supabase channel
	await supabase.removeChannel(channel);
};

/**
 * Create a new group chat
 */
export const createGroupChat = async (
	supabase: SupabaseClient,
	data: {
		name: string;
		description: string;
		created_by: string;
		is_public: boolean;
		participantIds: string[];
	}
): Promise<{ conversation: ChatConversation; group: ChatGroup } | null> => {
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
			name: data.name,
			description: data.description,
			created_by: data.created_by,
			is_public: data.is_public
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
	const participantData = data.participantIds.map((userId) => ({
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
};

/**
 * Join a group chat
 */
export const joinGroupChat = async (
	supabase: SupabaseClient,
	conversationId: string,
	userId: string
): Promise<boolean> => {
	const { error } = await supabase.from('chat_participants').insert({
		conversation_id: conversationId,
		user_id: userId
	});

	if (error) {
		console.error('Error joining group chat:', error);
		return false;
	}

	return true;
};

/**
 * Get group information for a conversation
 */
export const getGroupInfo = async (
	supabase: SupabaseClient,
	conversationId: string
): Promise<ChatGroup | null> => {
	const { data, error } = await supabase
		.from('chat_groups')
		.select('*')
		.eq('conversation_id', conversationId)
		.maybeSingle();

	if (error) {
		console.error('Error fetching group info:', error);
		return null;
	}

	return data as ChatGroup;
};

/**
 * Get all public group chats
 */
export const getPublicGroupChats = async (
	supabase: SupabaseClient
): Promise<(ChatGroup & { conversation: ChatConversation })[]> => {
	const { data, error } = await supabase
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
		console.error('Error fetching public group chats:', error);
		return [];
	}

	return data as (ChatGroup & { conversation: ChatConversation })[];
};
