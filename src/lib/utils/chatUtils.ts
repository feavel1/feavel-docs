// Chat related utils
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

export interface ChatParticipant {
	user_id: string;
	users: {
		full_name: string | null;
		username: string | null;
		avatar_file_id: string | null;
	};
}

export interface ChatMessage {
	id: number;
	message: string | null;
	created_at: string;
	sent_from: string | null;
	conversation_id: string | null;
	sent_from_avatar_url?: string;
	users?: {
		full_name: string | null;
		username: string | null;
		avatar_file_id: string | null;
	} | null;
}

export interface ChatConversation {
	id: string;
	created_at: string;
	chat_participants: ChatParticipant[];
	chat_messages: {
		message: string | null;
		created_at: string;
		sent_from: string | null;
	}[];
}

/**
 * Start a new conversation with a user
 * @param supabase Supabase client instance
 * @param currentUserId ID of the current user
 * @param username Username of the user to start conversation with
 * @returns Object with success status and conversation ID or error message
 */
export async function startConversation(
	supabase: SupabaseClient<Database>,
	currentUserId: string,
	username: string
): Promise<{ success: boolean; conversationId?: string; error?: string }> {
	try {
		// First, find the user by username
		const { data: userData, error: userError } = await supabase
			.from('users')
			.select('id')
			.eq('username', username)
			.single();

		if (userError || !userData) {
			return { success: false, error: 'User not found' };
		}

		// Check if a conversation already exists between these users
		const { data: existingConversations, error: conversationError } = await supabase
			.from('chat_participants')
			.select('conversation_id, user_id')
			.in('user_id', [currentUserId, userData.id]);

		if (conversationError) {
			return { success: false, error: 'Failed to check existing conversations' };
		}

		// Group participants by conversation_id
		const conversationParticipants: Record<string, string[]> = {};
		if (existingConversations) {
			existingConversations.forEach((participant) => {
				if (!conversationParticipants[participant.conversation_id]) {
					conversationParticipants[participant.conversation_id] = [];
				}
				conversationParticipants[participant.conversation_id].push(participant.user_id);
			});
		}

		// Find conversation with exactly these two users
		const existingConversationId = Object.keys(conversationParticipants).find((conversationId) => {
			const participants = conversationParticipants[conversationId];
			return (
				participants.length === 2 &&
				participants.includes(currentUserId) &&
				participants.includes(userData.id)
			);
		});

		if (existingConversationId) {
			return { success: true, conversationId: existingConversationId };
		}

		// Create a new conversation
		const { data: conversationData, error: createError } = await supabase
			.from('chat_conversations')
			.insert({
				id: crypto.randomUUID(),
				created_at: new Date().toISOString()
			})
			.select('id')
			.single();

		if (createError || !conversationData) {
			return { success: false, error: 'Failed to create conversation' };
		}

		// Add both users as participants
		const { error: participantsError } = await supabase.from('chat_participants').insert([
			{
				conversation_id: conversationData.id,
				user_id: currentUserId
			},
			{
				conversation_id: conversationData.id,
				user_id: userData.id
			}
		]);

		if (participantsError) {
			return { success: false, error: 'Failed to add participants to conversation' };
		}

		return { success: true, conversationId: conversationData.id };
	} catch (error: any) {
		return { success: false, error: error.message || 'An unexpected error occurred' };
	}
}

/**
 * Format time for display
 * @param dateString Date string to format
 * @returns Formatted time string (HH:MM)
 */
export function formatTime(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Get the other participant in a chat conversation
 * @param chat Chat conversation object
 * @param currentUserId ID of the current user
 * @returns The other participant's user data or null
 */
export function getOtherParticipant(chat: ChatConversation, currentUserId: string): any {
	if (!chat?.chat_participants || !currentUserId) return null;

	return chat.chat_participants.find((participant) => participant.user_id !== currentUserId)
		?.users;
}

/**
 * Load all chats for a user
 * @param supabase Supabase client instance
 * @param currentUserId ID of the current user
 * @returns Array of chat conversations or empty array
 */
export async function loadUserChats(
	supabase: SupabaseClient<Database>,
	currentUserId: string
): Promise<ChatConversation[]> {
	try {
		// First get all conversation IDs where current user is a participant
		const { data: participantData, error: participantError } = await supabase
			.from('chat_participants')
			.select('conversation_id')
			.eq('user_id', currentUserId);

		if (participantError) throw participantError;

		const conversationIds = participantData.map((p) => p.conversation_id);

		if (conversationIds.length === 0) {
			return [];
		}

		// Then get the conversation details with participants and last message
		const { data: chatData, error: chatError } = await supabase
			.from('chat_conversations')
			.select(
				`
				id,
				created_at,
				chat_participants(
					user_id,
					users(full_name, username, avatar_file_id)
				),
				chat_messages(
					message,
					created_at,
					sent_from
				)
			`
			)
			.in('id', conversationIds)
			.order('created_at', { referencedTable: 'chat_messages', ascending: false })
			.limit(1, { referencedTable: 'chat_messages' });

		if (chatError) throw chatError;

		return chatData || [];
	} catch (error) {
		console.error('Error loading chats:', error);
		return [];
	}
}

/**
 * Load messages for a specific chat with pagination
 * @param supabase Supabase client instance
 * @param chatId ID of the chat conversation
 * @param limit Number of messages to load (default: 50)
 * @param offset Offset for pagination (default: 0)
 * @returns Array of chat messages or empty array
 */
export async function loadChatMessages(
	supabase: SupabaseClient<Database>,
	chatId: string,
	limit: number = 50,
	offset: number = 0
): Promise<ChatMessage[]> {
	try {
		const { data: messageData, error } = await supabase
			.from('chat_messages')
			.select(
				`
				id,
				message,
				created_at,
				sent_from,
				conversation_id,
				users:sent_from(full_name, username, avatar_file_id)
			`
			)
			.eq('conversation_id', chatId)
			.order('created_at', { ascending: true })
			.range(offset, offset + limit - 1);

		if (error) throw error;

		return messageData || [];
	} catch (error) {
		console.error('Error loading messages:', error);
		return [];
	}
}