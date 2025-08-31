export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: '12.2.3 (519615d)';
	};
	public: {
		Tables: {
			chat_conversations: {
				Row: {
					created_at: string;
					id: string;
					name: string | null;
				};
				Insert: {
					created_at?: string;
					id: string;
					name?: string | null;
				};
				Update: {
					created_at?: string;
					id?: string;
					name?: string | null;
				};
				Relationships: [];
			};
			chat_messages: {
				Row: {
					conversation_id: string | null;
					created_at: string;
					id: number;
					message: string | null;
					sent_from: string | null;
				};
				Insert: {
					conversation_id?: string | null;
					created_at?: string;
					id?: number;
					message?: string | null;
					sent_from?: string | null;
				};
				Update: {
					conversation_id?: string | null;
					created_at?: string;
					id?: number;
					message?: string | null;
					sent_from?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'chat_messages_conversation_id_fkey';
						columns: ['conversation_id'];
						isOneToOne: false;
						referencedRelation: 'chat_conversations';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'message_sent_from_fkey';
						columns: ['sent_from'];
						isOneToOne: false;
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
			chat_participants: {
				Row: {
					conversation_id: string;
					user_id: string;
				};
				Insert: {
					conversation_id: string;
					user_id: string;
				};
				Update: {
					conversation_id?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'chat_participants_conversation_id_fkey';
						columns: ['conversation_id'];
						isOneToOne: false;
						referencedRelation: 'chat_conversations';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'chat_participants_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
			digital_order: {
				Row: {
					created_at: string;
					description: string | null;
					id: string;
					service_id: number | null;
					user_id: string | null;
				};
				Insert: {
					created_at?: string;
					description?: string | null;
					id: string;
					service_id?: number | null;
					user_id?: string | null;
				};
				Update: {
					created_at?: string;
					description?: string | null;
					id?: string;
					service_id?: number | null;
					user_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'digital_order_service_id_fkey';
						columns: ['service_id'];
						isOneToOne: false;
						referencedRelation: 'services';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'digital_order_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
			events: {
				Row: {
					created_at: string | null;
					description: string | null;
					duration: unknown;
					event_type: string;
					id: string;
					is_public: boolean | null;
					metadata: Json | null;
					service_id: number | null;
					status: string;
					studio_id: number;
					title: string;
					updated_at: string | null;
					user_id: string | null;
				};
				Insert: {
					created_at?: string | null;
					description?: string | null;
					duration: unknown;
					event_type?: string;
					id?: string;
					is_public?: boolean | null;
					metadata?: Json | null;
					service_id?: number | null;
					status?: string;
					studio_id: number;
					title: string;
					updated_at?: string | null;
					user_id?: string | null;
				};
				Update: {
					created_at?: string | null;
					description?: string | null;
					duration?: unknown;
					event_type?: string;
					id?: string;
					is_public?: boolean | null;
					metadata?: Json | null;
					service_id?: number | null;
					status?: string;
					studio_id?: number;
					title?: string;
					updated_at?: string | null;
					user_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'events_service_id_fkey';
						columns: ['service_id'];
						isOneToOne: false;
						referencedRelation: 'services_v2';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'events_studio_id_fkey';
						columns: ['studio_id'];
						isOneToOne: false;
						referencedRelation: 'studios';
						referencedColumns: ['id'];
					}
				];
			};
			post_comments: {
				Row: {
					content: string;
					created_at: string;
					id: number;
					is_deleted: boolean | null;
					parent_id: number | null;
					post_id: number;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					content: string;
					created_at?: string;
					id?: number;
					is_deleted?: boolean | null;
					parent_id?: number | null;
					post_id: number;
					updated_at?: string;
					user_id: string;
				};
				Update: {
					content?: string;
					created_at?: string;
					id?: number;
					is_deleted?: boolean | null;
					parent_id?: number | null;
					post_id?: number;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'post_comments_parent_id_fkey';
						columns: ['parent_id'];
						isOneToOne: false;
						referencedRelation: 'post_comments';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'post_comments_post_id_fkey';
						columns: ['post_id'];
						isOneToOne: false;
						referencedRelation: 'posts';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'post_comments_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
			post_likes: {
				Row: {
					created_at: string;
					id: number;
					post_id: number;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					id?: number;
					post_id: number;
					user_id: string;
				};
				Update: {
					created_at?: string;
					id?: number;
					post_id?: number;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'post_likes_post_id_fkey';
						columns: ['post_id'];
						isOneToOne: false;
						referencedRelation: 'posts';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'post_likes_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
			post_tags: {
				Row: {
					created_at: string;
					id: number;
					tag_name: string;
				};
				Insert: {
					created_at?: string;
					id?: number;
					tag_name: string;
				};
				Update: {
					created_at?: string;
					id?: number;
					tag_name?: string;
				};
				Relationships: [];
			};
			posts: {
				Row: {
					content: Json | null;
					content_v2: Json | null;
					created_at: string;
					id: number;
					post_cover: string | null;
					post_views: number;
					public_visibility: boolean | null;
					title: string | null;
					user_id: string | null;
				};
				Insert: {
					content?: Json | null;
					content_v2?: Json | null;
					created_at?: string;
					id?: number;
					post_cover?: string | null;
					post_views?: number;
					public_visibility?: boolean | null;
					title?: string | null;
					user_id?: string | null;
				};
				Update: {
					content?: Json | null;
					content_v2?: Json | null;
					created_at?: string;
					id?: number;
					post_cover?: string | null;
					post_views?: number;
					public_visibility?: boolean | null;
					title?: string | null;
					user_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'posts_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
			posts_tags_rel: {
				Row: {
					id: number;
					post_id: number | null;
					tag_id: number | null;
				};
				Insert: {
					id?: number;
					post_id?: number | null;
					tag_id?: number | null;
				};
				Update: {
					id?: number;
					post_id?: number | null;
					tag_id?: number | null;
				};
				Relationships: [
					{
						foreignKeyName: 'posts_tags_rel_post_id_fkey';
						columns: ['post_id'];
						isOneToOne: false;
						referencedRelation: 'posts';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'posts_tags_rel_tag_id_fkey';
						columns: ['tag_id'];
						isOneToOne: false;
						referencedRelation: 'post_tags';
						referencedColumns: ['id'];
					}
				];
			};
			services: {
				Row: {
					cover_url: string | null;
					created_at: string;
					created_by: number;
					description: string;
					enabled: boolean;
					highlights: Json;
					id: number;
					name: string;
					price: number;
					status: Database['public']['Enums']['status'] | null;
				};
				Insert: {
					cover_url?: string | null;
					created_at?: string;
					created_by: number;
					description: string;
					enabled?: boolean;
					highlights: Json;
					id: number;
					name: string;
					price: number;
					status?: Database['public']['Enums']['status'] | null;
				};
				Update: {
					cover_url?: string | null;
					created_at?: string;
					created_by?: number;
					description?: string;
					enabled?: boolean;
					highlights?: Json;
					id?: number;
					name?: string;
					price?: number;
					status?: Database['public']['Enums']['status'] | null;
				};
				Relationships: [
					{
						foreignKeyName: 'services_created_by_fkey';
						columns: ['created_by'];
						isOneToOne: false;
						referencedRelation: 'studios';
						referencedColumns: ['id'];
					}
				];
			};
			services_category: {
				Row: {
					category_name: string | null;
					created_at: string;
					id: number;
				};
				Insert: {
					category_name?: string | null;
					created_at?: string;
					id?: number;
				};
				Update: {
					category_name?: string | null;
					created_at?: string;
					id?: number;
				};
				Relationships: [];
			};
			services_category_rel: {
				Row: {
					category_id: number | null;
					created_at: string;
					id: number;
					service_id: number | null;
				};
				Insert: {
					category_id?: number | null;
					created_at?: string;
					id?: number;
					service_id?: number | null;
				};
				Update: {
					category_id?: number | null;
					created_at?: string;
					id?: number;
					service_id?: number | null;
				};
				Relationships: [
					{
						foreignKeyName: 'services_category_rel_category_id_fkey';
						columns: ['category_id'];
						isOneToOne: false;
						referencedRelation: 'services_category';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'services_category_rel_service_id_fkey';
						columns: ['service_id'];
						isOneToOne: false;
						referencedRelation: 'services';
						referencedColumns: ['id'];
					}
				];
			};
			services_v2: {
				Row: {
					cover_url: string | null;
					created_at: string | null;
					created_by: number;
					description: Json | null;
					enabled: boolean | null;
					highlights: Json | null;
					id: number;
					name: string;
					price: number;
					service_type: string;
					status: Database['public']['Enums']['status'] | null;
				};
				Insert: {
					cover_url?: string | null;
					created_at?: string | null;
					created_by: number;
					description?: Json | null;
					enabled?: boolean | null;
					highlights?: Json | null;
					id?: number;
					name: string;
					price: number;
					service_type?: string;
					status?: Database['public']['Enums']['status'] | null;
				};
				Update: {
					cover_url?: string | null;
					created_at?: string | null;
					created_by?: number;
					description?: Json | null;
					enabled?: boolean | null;
					highlights?: Json | null;
					id?: number;
					name?: string;
					price?: number;
					service_type?: string;
					status?: Database['public']['Enums']['status'] | null;
				};
				Relationships: [
					{
						foreignKeyName: 'services_v2_created_by_fkey';
						columns: ['created_by'];
						isOneToOne: false;
						referencedRelation: 'studios';
						referencedColumns: ['id'];
					}
				];
			};
			studios: {
				Row: {
					contact_phone: number;
					created_at: string;
					description: string;
					id: number;
					name: string;
					salary_expectation: string;
					status: Database['public']['Enums']['status'];
					user_id: string;
				};
				Insert: {
					contact_phone: number;
					created_at?: string;
					description: string;
					id?: number;
					name: string;
					salary_expectation: string;
					status?: Database['public']['Enums']['status'];
					user_id: string;
				};
				Update: {
					contact_phone?: number;
					created_at?: string;
					description?: string;
					id?: number;
					name?: string;
					salary_expectation?: string;
					status?: Database['public']['Enums']['status'];
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'studios_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: true;
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
			users: {
				Row: {
					avatar_url: string | null;
					birthday: string | null;
					description: string | null;
					full_name: string | null;
					id: string;
					username: string | null;
				};
				Insert: {
					avatar_url?: string | null;
					birthday?: string | null;
					description?: string | null;
					full_name?: string | null;
					id: string;
					username?: string | null;
				};
				Update: {
					avatar_url?: string | null;
					birthday?: string | null;
					description?: string | null;
					full_name?: string | null;
					id?: string;
					username?: string | null;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			content_string: {
				Args: { searchparams: string };
				Returns: {
					created_at: string;
					id: number;
					title: string;
				}[];
			};
			update_post_tags: {
				Args: { post_id_param: number; tag_names: string[] };
				Returns: undefined;
			};
			update_views: {
				Args: { page_id: number };
				Returns: undefined;
			};
		};
		Enums: {
			purchase_status:
				| 'created'
				| 'canceled'
				| 'paid'
				| 'finished'
				| 'refund_start'
				| 'refund_finished';
			status: 'applied' | 'approved' | 'incomplete' | 'disabled' | 'blocked';
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema['Enums']
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
		: never = never
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
		? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema['CompositeTypes']
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
		? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	public: {
		Enums: {
			purchase_status: [
				'created',
				'canceled',
				'paid',
				'finished',
				'refund_start',
				'refund_finished'
			],
			status: ['applied', 'approved', 'incomplete', 'disabled', 'blocked']
		}
	}
} as const;
