import type { SupabaseClient } from '@supabase/supabase-js';
import type { Tables } from '$lib/types/database.types';

// Simplified type exports
export type ChatConversation = Tables<'chat_conversations'>;
export type ChatMessage = Tables<'chat_messages'>;
export type ChatParticipant = Tables<'chat_participants'>;
export type ChatGroup = Tables<'chat_groups'>;

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
		.on(
			'postgres_changes',
			{
				event: 'INSERT',
				schema: 'public',
				table: 'chat_messages',
				filter: `conversation_id=eq.${conversationId}`
			},
			(payload) => {
				console.log('Received postgres_changes INSERT message:', payload);
				// Handle direct postgres changes
				if (payload.new) {
					const message = payload.new as ChatMessage;
					callback(message);
				}
			}
		)
		.subscribe((status) => {
			console.log('Message subscription status:', status);
		});

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
	// We need to listen for changes to chat_participants table to detect new conversations for this user
	const channel = supabase
		.channel(`chat:user:${userId}:conversations`)
		.on(
			'postgres_changes',
			{
				event: 'INSERT',
				schema: 'public',
				table: 'chat_participants',
				filter: `user_id=eq.${userId}`
			},
			(payload) => {
				console.log('Received postgres_changes INSERT participant:', payload);
				// When a new participant is added for this user, we need to fetch the conversation details
				if (payload.new) {
					const participant = payload.new as ChatParticipant;
					// Fetch the conversation details
					supabase
						.from('chat_conversations')
						.select(
							`
						id,
						created_at,
						chat_participants(user_id),
						chat_groups(name, description, is_public)
						`
						)
						.eq('id', participant.conversation_id)
						.single()
						.then(({ data, error }) => {
							if (error) {
								console.error('Error fetching conversation:', error);
							} else if (data) {
								callback(data as ChatConversation);
							}
						});
				}
			}
		)
		.subscribe((status) => {
			console.log('Conversation subscription status:', status);
		});

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
