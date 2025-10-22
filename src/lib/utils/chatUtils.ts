import type { SupabaseClient } from '@supabase/supabase-js';
import { FileStorage } from '$lib/services/storage';

/**
 * Start a new conversation with a user by username
 * @param supabase Supabase client instance
 * @param currentUserId ID of the current user
 * @param username Username of the user to start conversation with
 * @returns Object with success status and conversation data or error message
 */
export async function startConversation(
	supabase: SupabaseClient,
	currentUserId: string,
	username: string
): Promise<{ success: boolean; data?: any; error?: string }> {
	try {
		// First, find the user by username
		const { data: userData, error: userError } = await supabase
			.from('users')
			.select('id')
			.eq('username', username)
			.single();

		if (userError) {
			console.error('Error finding user:', userError);
			return { success: false, error: 'User not found' };
		}

		if (!userData) {
			return { success: false, error: 'User not found' };
		}

		// Check if conversation already exists between these users
		// This is a simplified check - in a production app, you'd want more robust logic
		const { data: participantData, error: participantError } = await supabase
			.from('chat_participants')
			.select('conversation_id')
			.eq('user_id', currentUserId);

		if (!participantError && participantData) {
			// For each conversation the current user is in, check if the target user is also in it
			for (const participant of participantData) {
				const { data: otherParticipantData, error: otherError } = await supabase
					.from('chat_participants')
					.select('user_id')
					.eq('conversation_id', participant.conversation_id)
					.eq('user_id', userData.id);

				if (!otherError && otherParticipantData && otherParticipantData.length > 0) {
					// Conversation already exists
					const { data: conversationData, error: convError } = await supabase
						.from('chat_conversations')
						.select('*')
						.eq('id', participant.conversation_id)
						.single();

					if (!convError && conversationData) {
						return { success: true, data: conversationData };
					}
				}
			}
		}

		// Create new conversation
		const { data: conversation, error: convCreateError } = await supabase
			.from('chat_conversations')
			.insert([{}])
			.select()
			.single();

		if (convCreateError) {
			console.error('Error creating conversation:', convCreateError);
			return { success: false, error: 'Failed to create conversation' };
		}

		// Add participants
		const { error: partError } = await supabase.from('chat_participants').insert([
			{ conversation_id: conversation.id, user_id: currentUserId },
			{ conversation_id: conversation.id, user_id: userData.id }
		]);

		if (partError) {
			console.error('Error adding participants:', partError);
			return { success: false, error: 'Failed to add participants' };
		}

		return { success: true, data: conversation };
	} catch (error: any) {
		console.error('Error starting conversation:', error.message);
		return { success: false, error: 'Failed to start conversation' };
	}
}

/**
 * Get avatar URL from avatar file ID
 * @param supabase Supabase client instance
 * @param avatarFileId File storage ID for the avatar
 * @returns Avatar URL or null if not found
 */
export async function getAvatarUrl(
	supabase: SupabaseClient,
	avatarFileId: string | null
): Promise<string | null> {
	if (!avatarFileId) return null;

	try {
		const storage = new FileStorage(supabase);
		const url = await storage.getUrl(avatarFileId);
		return url || null;
	} catch (error) {
		console.error('Error getting avatar URL:', error);
		return null;
	}
}

/**
 * Get user data with avatar URL resolved
 * @param supabase Supabase client instance
 * @param userId User ID
 * @returns User data with resolved avatar URL
 */
export async function getUserWithAvatar(supabase: SupabaseClient, userId: string): Promise<any> {
	const { data: user, error } = await supabase
		.from('users')
		.select('id, full_name, username, avatar_file_id')
		.eq('id', userId)
		.single();

	if (error || !user) {
		return null;
	}

	// Resolve avatar URL if avatar_file_id exists
	if (user.avatar_file_id) {
		const avatarUrl = await getAvatarUrl(supabase, user.avatar_file_id);
		return {
			...user,
			avatar_url: avatarUrl
		};
	}

	return user;
}

/**
 * Add avatar URLs to chat participants
 * @param supabase Supabase client instance
 * @param chats Array of chat conversations with participants
 * @returns Chats with resolved avatar URLs for participants
 */
export async function addAvatarUrlsToChatParticipants(
	supabase: SupabaseClient,
	chats: any[]
): Promise<any[]> {
	// Create a map of user IDs to avatar URLs to avoid duplicate requests
	const avatarUrlMap = new Map<string, string | null>();

	// Collect all unique user IDs from chat participants
	const userIds = Array.from(
		new Set(
			chats
				.flatMap((chat) => chat.chat_participants || [])
				.map((participant) => participant.users?.id)
				.filter((id) => id)
		)
	);

	// Fetch avatar URLs for all users
	for (const userId of userIds) {
		if (!avatarUrlMap.has(userId)) {
			const user = await getUserWithAvatar(supabase, userId);
			avatarUrlMap.set(userId, user?.avatar_url || null);
		}
	}

	// Add avatar URLs to chat participants
	return chats.map((chat) => ({
		...chat,
		chat_participants: (chat.chat_participants || []).map((participant: any) => ({
			...participant,
			users: participant.users
				? {
						...participant.users,
						avatar_url: participant.users.id ? avatarUrlMap.get(participant.users.id) || null : null
					}
				: null
		}))
	}));
}

/**
 * Add avatar URLs to messages
 * @param supabase Supabase client instance
 * @param messages Array of messages
 * @returns Messages with resolved avatar URLs
 */
export async function addAvatarUrlsToMessages(
	supabase: SupabaseClient,
	messages: any[]
): Promise<any[]> {
	// Create a map of user IDs to avatar URLs to avoid duplicate requests
	const avatarUrlMap = new Map<string, string | null>();

	// Collect all unique user IDs from messages
	const userIds = Array.from(new Set(messages.map((msg) => msg.sent_from).filter((id) => id)));

	// Fetch avatar URLs for all users
	for (const userId of userIds) {
		if (!avatarUrlMap.has(userId)) {
			const user = await getUserWithAvatar(supabase, userId);
			avatarUrlMap.set(userId, user?.avatar_url || null);
		}
	}

	// Add avatar URLs to messages
	return messages.map((msg) => ({
		...msg,
		sent_from_avatar_url: msg.sent_from ? avatarUrlMap.get(msg.sent_from) || null : null
	}));
}
