# Remote Functions

Type-safe client-server communication. Runs on server but callable from anywhere.

## Configuration

```js
/// file: svelte.config.js
const config = {
	kit: {
		experimental: {
			remoteFunctions: true
		}
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};
export default config;
```

## Function Types

### query

Read dynamic data from server:

```js
// Declaration
import { query } from '$app/server';
export const getPosts = query(async () => {
	// Server-side code
	const posts = await db.sql`SELECT title, slug FROM post`;
	return posts;
});

// Usage
import { getPosts } from './data.remote';
{#each await getPosts() as { title, slug }}
	<a href="/blog/{slug}">{title}</a>
{/each}

// With validation
export const getPost = query(v.string(), async (slug) => {
	const [post] = await db.sql`SELECT * FROM post WHERE slug = ${slug}`;
	if (!post) error(404, 'Not found');
	return post;
});
```

### form

Write data with built-in validation:

```js
// Declaration
export const createPost = form(
	v.object({
		title: v.pipe(v.string(), v.nonEmpty()),
		content: v.pipe(v.string(), v.nonEmpty())
	}),
	async ({ title, content }) => {
		const user = await auth.getUser();
		if (!user) error(401, 'Unauthorized');

		const slug = title.toLowerCase().replace(/ /g, '-');
		await db.sql`INSERT INTO post (slug, title, content) VALUES (${slug}, ${title}, ${content})`;
		redirect(303, `/blog/${slug}`);
	}
);

// Usage
<form {...createPost}>
	<input {...createPost.fields.title.as('text')} />
	<textarea {...createPost.fields.content.as('text')}></textarea>
	<button>Publish!</button>
</form>;
```

### command

Server-side actions callable from anywhere:

```js
// Declaration
export const addLike = command(v.string(), async (id) => {
	await db.sql`UPDATE item SET likes = likes + 1 WHERE id = ${id}`;
	getLikes(id).refresh(); // Refresh related query
});

// Usage
<button onclick={() => addLike(item.id)}>add like</button>;
```

### prerender

Static data (changes only on redeployment):

```js
// Declaration
export const getStaticPosts = prerender(async () => {
	const posts = await db.sql`SELECT title, slug FROM post ORDER BY published_at DESC`;
	return posts;
});
```

## Validation

Use Standard Schema libraries (Zod, Valibot):

```js
import * as v from 'valibot';
export const getPost = query(v.string(), async (slug) => {
	// slug is automatically validated
});
```

## Key Features

- **Caching:** Automatic query caching while on page
- **Type safety:** Arguments and return values validated
- **Error handling:** `<svelte:boundary>` handles errors
- **Refresh:** `.refresh()` to re-fetch data
- **Optimistic updates:** `.withOverride()` for immediate UI updates
