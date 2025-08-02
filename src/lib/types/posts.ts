export interface Post {
	id: string;
	title: string;
	content?: string;
	content_v2?: any;
	post_cover?: string;
	post_views?: number;
	created_at: string;
	user_id: string;
	public_visibility: boolean;
	users?: {
		username: string;
		avatar_url?: string;
	};
	posts_tags_rel?: Array<{
		post_tags: {
			tag_name: string;
		};
	}>;
}

export interface Tag {
	id: number;
	tag_name: string;
}

export interface PostsPageData {
	session: any;
	posts: Post[];
	tags: Tag[];
}

export interface PostFilters {
	searchQuery: string;
	selectedTags: string[];
}
