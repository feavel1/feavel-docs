import type { SupabaseClient } from '@supabase/supabase-js';

export async function searchPosts(supabase: SupabaseClient, query: string) {
	const { data, error } = await supabase
		.from('posts')
		.select(
			`
			*,
			users!inner(username, avatar_url),
			posts_tags_rel(
				post_tags!inner(tag_name)
			)
		`
		)
		.eq('public_visibility', true)
		.or(`title.ilike.%${query}%,content_v2::text.ilike.%${query}%`)
		.order('created_at', { ascending: false });

	return { data, error };
}

export async function searchPostsByTag(supabase: SupabaseClient, tag: string) {
	const { data, error } = await supabase
		.from('posts')
		.select(
			`
			*,
			users!inner(username, avatar_url),
			posts_tags_rel(
				post_tags!inner(tag_name)
			)
		`
		)
		.eq('public_visibility', true)
		.eq('posts_tags_rel.post_tags.tag_name', tag)
		.order('created_at', { ascending: false });

	return { data, error };
}

export async function getPopularTags(supabase: SupabaseClient, limit = 10) {
	const { data, error } = await supabase
		.from('post_tags')
		.select(`
			tag_name,
			posts_tags_rel(count)
		`)
		.order('posts_tags_rel.count', { ascending: false })
		.limit(limit);

	return { data, error };
}

export function highlightSearchTerm(text: string, query: string): string {
	if (!query.trim()) return text;
	
	const regex = new RegExp(`(${query})`, 'gi');
	return text.replace(regex, '<mark>$1</mark>');
} 