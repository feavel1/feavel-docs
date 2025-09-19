/posts/[post_id] code simplification plan.

Proposed Simplifications

1.  Consolidate Post Operations

- Move all post creation/update logic to utility functions in src/lib/utils/posts.ts
- Remove direct API calls from +page.svelte
- Create dedicated functions: createPost, updatePost, deletePost

2.  Extract Components

- Extract the post editor section into a separate component
- Extract the post header/author section into a separate component
- Extract the post actions (like, etc.) into a separate component

3.  Simplify State Management

- Reduce the number of reactive state variables in +page.svelte
- Consolidate related state into objects where appropriate
- Use derived stores for computed values

4.  Improve Utility Organization

- Add post-specific utility functions to src/lib/utils/posts.ts
- Standardize function signatures and error handling
- Add proper TypeScript typing for all functions

5.  Streamline Data Flow

- Simplify the data loading in +page.server.ts
- Reduce coupling between components
- Use consistent data structures throughout the application

Implementation Steps

1.  Create new utility functions for post operations
2.  Extract components from +page.svelte
3.  Update +page.svelte to use new utility functions and components
4.  Simplify +page.server.ts
5.  Remove redundant code from /api/posts/+server.ts
