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
				};
				Insert: {
					created_at?: string;
					id: string;
				};
				Update: {
					created_at?: string;
					id?: string;
				};
				Relationships: [];
			};
			chat_groups: {
				Row: {
					conversation_id: string | null;
					created_at: string | null;
					created_by: number | null;
					description: string | null;
					id: string;
					is_public: boolean | null;
					name: string;
				};
				Insert: {
					conversation_id?: string | null;
					created_at?: string | null;
					created_by?: number | null;
					description?: string | null;
					id?: string;
					is_public?: boolean | null;
					name: string;
				};
				Update: {
					conversation_id?: string | null;
					created_at?: string | null;
					created_by?: number | null;
					description?: string | null;
					id?: string;
					is_public?: boolean | null;
					name?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'chat_groups_conversation_id_fkey';
						columns: ['conversation_id'];
						isOneToOne: false;
						referencedRelation: 'chat_conversations';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'chat_groups_created_by_fkey';
						columns: ['created_by'];
						isOneToOne: false;
						referencedRelation: 'studios';
						referencedColumns: ['id'];
					}
				];
			};
			chat_messages: {
				Row: {
					conversation_id: string;
					created_at: string;
					id: number;
					message: string;
					sent_from: string | null;
				};
				Insert: {
					conversation_id: string;
					created_at?: string;
					id?: number;
					message: string;
					sent_from?: string | null;
				};
				Update: {
					conversation_id?: string;
					created_at?: string;
					id?: number;
					message?: string;
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
						foreignKeyName: 'chat_messages_sent_from_fkey';
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
			digital_access: {
				Row: {
					created_at: string;
					download_count: number;
					expires_at: string | null;
					file_storage_id: string | null;
					id: string;
					order_id: string;
					revoked_at: string | null;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					download_count?: number;
					expires_at?: string | null;
					file_storage_id?: string | null;
					id?: string;
					order_id: string;
					revoked_at?: string | null;
					user_id: string;
				};
				Update: {
					created_at?: string;
					download_count?: number;
					expires_at?: string | null;
					file_storage_id?: string | null;
					id?: string;
					order_id?: string;
					revoked_at?: string | null;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'digital_access_file_storage_id_fkey';
						columns: ['file_storage_id'];
						isOneToOne: false;
						referencedRelation: 'file_storage';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'digital_access_order_id_fkey';
						columns: ['order_id'];
						isOneToOne: false;
						referencedRelation: 'digital_order';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'digital_access_user_id_fkey';
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
					id: string;
					service_id: string;
					status: Database['public']['Enums']['purchase_status'];
					user_id: string;
				};
				Insert: {
					created_at?: string;
					id?: string;
					service_id: string;
					status?: Database['public']['Enums']['purchase_status'];
					user_id: string;
				};
				Update: {
					created_at?: string;
					id?: string;
					service_id?: string;
					status?: Database['public']['Enums']['purchase_status'];
					user_id?: string;
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
			file_storage: {
				Row: {
					access_count: number | null;
					access_limit: number | null;
					bucket_name: string;
					entity_id: string | null;
					entity_type: string | null;
					expires_at: string | null;
					file_size: number;
					file_type: string;
					id: string;
					is_public: boolean | null;
					metadata: Json | null;
					mime_type: string | null;
					original_filename: string;
					storage_path: string;
					upload_date: string | null;
					uploader_user_id: string | null;
				};
				Insert: {
					access_count?: number | null;
					access_limit?: number | null;
					bucket_name: string;
					entity_id?: string | null;
					entity_type?: string | null;
					expires_at?: string | null;
					file_size: number;
					file_type: string;
					id?: string;
					is_public?: boolean | null;
					metadata?: Json | null;
					mime_type?: string | null;
					original_filename: string;
					storage_path: string;
					upload_date?: string | null;
					uploader_user_id?: string | null;
				};
				Update: {
					access_count?: number | null;
					access_limit?: number | null;
					bucket_name?: string;
					entity_id?: string | null;
					entity_type?: string | null;
					expires_at?: string | null;
					file_size?: number;
					file_type?: string;
					id?: string;
					is_public?: boolean | null;
					metadata?: Json | null;
					mime_type?: string | null;
					original_filename?: string;
					storage_path?: string;
					upload_date?: string | null;
					uploader_user_id?: string | null;
				};
				Relationships: [];
			};
			posts: {
				Row: {
					content_v2: Json;
					cover_file_id: string | null;
					created_at: string;
					embedded_file_ids: string[] | null;
					id: number;
					post_views: number;
					public_visibility: boolean;
					title: string | null;
					user_id: string;
				};
				Insert: {
					content_v2: Json;
					cover_file_id?: string | null;
					created_at?: string;
					embedded_file_ids?: string[] | null;
					id?: number;
					post_views?: number;
					public_visibility?: boolean;
					title?: string | null;
					user_id: string;
				};
				Update: {
					content_v2?: Json;
					cover_file_id?: string | null;
					created_at?: string;
					embedded_file_ids?: string[] | null;
					id?: number;
					post_views?: number;
					public_visibility?: boolean;
					title?: string | null;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'posts_cover_file_id_fkey';
						columns: ['cover_file_id'];
						isOneToOne: false;
						referencedRelation: 'file_storage';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'posts_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
			posts_comments: {
				Row: {
					content: string;
					created_at: string;
					id: number;
					is_deleted: boolean;
					parent_id: number | null;
					post_id: number;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					content: string;
					created_at?: string;
					id?: number;
					is_deleted?: boolean;
					parent_id?: number | null;
					post_id: number;
					updated_at?: string;
					user_id: string;
				};
				Update: {
					content?: string;
					created_at?: string;
					id?: number;
					is_deleted?: boolean;
					parent_id?: number | null;
					post_id?: number;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'posts_comments_parent_id_fkey';
						columns: ['parent_id'];
						isOneToOne: false;
						referencedRelation: 'posts_comments';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'posts_comments_post_id_fkey';
						columns: ['post_id'];
						isOneToOne: false;
						referencedRelation: 'posts';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'posts_comments_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
			posts_likes: {
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
						foreignKeyName: 'posts_likes_post_id_fkey';
						columns: ['post_id'];
						isOneToOne: false;
						referencedRelation: 'posts';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'posts_likes_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
			posts_tags: {
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
			posts_tags_rel: {
				Row: {
					id: number;
					post_id: number;
					tag_id: number;
				};
				Insert: {
					id?: number;
					post_id: number;
					tag_id: number;
				};
				Update: {
					id?: number;
					post_id?: number;
					tag_id?: number;
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
						referencedRelation: 'posts_tags';
						referencedColumns: ['id'];
					}
				];
			};
			service_downloads: {
				Row: {
					created_at: string | null;
					preview_file_id: string | null;
					product_file_id: string | null;
					service_id: string;
				};
				Insert: {
					created_at?: string | null;
					preview_file_id?: string | null;
					product_file_id?: string | null;
					service_id: string;
				};
				Update: {
					created_at?: string | null;
					preview_file_id?: string | null;
					product_file_id?: string | null;
					service_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'service_downloads_preview_file_id_fkey';
						columns: ['preview_file_id'];
						isOneToOne: false;
						referencedRelation: 'file_storage';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'service_downloads_product_file_id_fkey';
						columns: ['product_file_id'];
						isOneToOne: false;
						referencedRelation: 'file_storage';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'service_downloads_service_id_fkey';
						columns: ['service_id'];
						isOneToOne: true;
						referencedRelation: 'services';
						referencedColumns: ['id'];
					}
				];
			};
			service_videos: {
				Row: {
					created_at: string | null;
					duration_sec: number | null;
					service_id: string;
					thumbnail_file_id: string | null;
					trailer_file_id: string | null;
					video_file_id: string | null;
				};
				Insert: {
					created_at?: string | null;
					duration_sec?: number | null;
					service_id: string;
					thumbnail_file_id?: string | null;
					trailer_file_id?: string | null;
					video_file_id?: string | null;
				};
				Update: {
					created_at?: string | null;
					duration_sec?: number | null;
					service_id?: string;
					thumbnail_file_id?: string | null;
					trailer_file_id?: string | null;
					video_file_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'service_videos_service_id_fkey';
						columns: ['service_id'];
						isOneToOne: true;
						referencedRelation: 'services';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'service_videos_thumbnail_file_id_fkey';
						columns: ['thumbnail_file_id'];
						isOneToOne: false;
						referencedRelation: 'file_storage';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'service_videos_trailer_file_id_fkey';
						columns: ['trailer_file_id'];
						isOneToOne: false;
						referencedRelation: 'file_storage';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'service_videos_video_file_id_fkey';
						columns: ['video_file_id'];
						isOneToOne: false;
						referencedRelation: 'file_storage';
						referencedColumns: ['id'];
					}
				];
			};
			services: {
				Row: {
					cover_file_id: string | null;
					created_at: string;
					created_by: number;
					description: Json;
					enabled: boolean;
					highlights: Json;
					id: string;
					name: string;
					price: number;
					status: Database['public']['Enums']['status'];
					type: Database['public']['Enums']['service_type'];
				};
				Insert: {
					cover_file_id?: string | null;
					created_at?: string;
					created_by: number;
					description: Json;
					enabled?: boolean;
					highlights: Json;
					id?: string;
					name: string;
					price?: number;
					status?: Database['public']['Enums']['status'];
					type: Database['public']['Enums']['service_type'];
				};
				Update: {
					cover_file_id?: string | null;
					created_at?: string;
					created_by?: number;
					description?: Json;
					enabled?: boolean;
					highlights?: Json;
					id?: string;
					name?: string;
					price?: number;
					status?: Database['public']['Enums']['status'];
					type?: Database['public']['Enums']['service_type'];
				};
				Relationships: [
					{
						foreignKeyName: 'services_cover_file_id_fkey';
						columns: ['cover_file_id'];
						isOneToOne: false;
						referencedRelation: 'file_storage';
						referencedColumns: ['id'];
					},
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
					category_name: string;
					created_at: string;
					id: number;
				};
				Insert: {
					category_name: string;
					created_at?: string;
					id?: number;
				};
				Update: {
					category_name?: string;
					created_at?: string;
					id?: number;
				};
				Relationships: [];
			};
			services_category_rel: {
				Row: {
					category_id: number;
					created_at: string;
					id: number;
					service_id: string;
				};
				Insert: {
					category_id: number;
					created_at?: string;
					id?: number;
					service_id: string;
				};
				Update: {
					category_id?: number;
					created_at?: string;
					id?: number;
					service_id?: string;
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
					avatar_file_id: string | null;
					birthday: string | null;
					description: string | null;
					full_name: string | null;
					id: string;
					username: string | null;
				};
				Insert: {
					avatar_file_id?: string | null;
					birthday?: string | null;
					description?: string | null;
					full_name?: string | null;
					id: string;
					username?: string | null;
				};
				Update: {
					avatar_file_id?: string | null;
					birthday?: string | null;
					description?: string | null;
					full_name?: string | null;
					id?: string;
					username?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'users_avatar_file_id_fkey';
						columns: ['avatar_file_id'];
						isOneToOne: false;
						referencedRelation: 'file_storage';
						referencedColumns: ['id'];
					}
				];
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
			update_service_categories: {
				Args: { category_names: Json; service_id_param: string };
				Returns: undefined;
			};
			update_views: { Args: { page_id: number }; Returns: undefined };
		};
		Enums: {
			purchase_status:
				| 'created'
				| 'canceled'
				| 'paid'
				| 'finished'
				| 'refund_start'
				| 'refund_finished';
			service_type: 'video' | 'download' | 'event' | 'subscription';
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
			service_type: ['video', 'download', 'event', 'subscription'],
			status: ['applied', 'approved', 'incomplete', 'disabled', 'blocked']
		}
	}
} as const;
