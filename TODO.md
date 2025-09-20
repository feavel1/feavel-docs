Plan for Implementing Immediate Draft Creation for Posts

Core Concept:

Instead of handling "new" posts as a special case, create a minimal draft post immediately when the
user wants to create a new post. This unifies the data flow for both new and existing posts.

Implementation Steps:

1.  Modify the Load Function (+page.server.ts)

- Remove the special handling for post_id === 'new'
- Add a new route handler for /posts/new that creates a draft post
- Redirect from /posts/new to /posts/{new_post_id} after creation

2.  Create Draft Post Handler

When user navigates to /posts/new:

- Check if user is authenticated
- Create minimal draft post in database using existing function from posts.ts
- Redirect to /posts/{new_post_id} with 302 redirect

3.  Simplified Post Loading

Main load function now only needs to handle loading existing posts:

- Fetch post data with all related information
- Check permissions (simplified since we always have a real post)
- Prepare form data with consistent structure
- Fetch tags only when user can edit

4.  Unified Actions

- Single save action that works for both new and existing posts
- Single delete action that works from anywhere
- Use existing utility functions from src/lib/utils/posts.ts

5.  Client-Side Simplification

- Remove "isNewPost" logic completely
- Always treat as "editing an existing post"
- Simplified permission checks based on server-provided data
- Consistent data structure for all scenarios

Data Flow Structure:

User clicks "New Post"
→ Navigate to /posts/new
→ Server creates minimal draft post
→ Server redirects to /posts/{new_post_id}
→ Normal post loading flow (now unified)
→ Client receives consistent data structure
→ User edits post normally

File Changes Required:

A. Create new route handler:

Create /src/routes/posts/new/+page.server.ts:

- Handles GET requests only
- Creates draft post for authenticated users
- Redirects to new post URL

B. Modify existing post handler:

Update /src/routes/posts/[post_id]/+page.server.ts:

- Remove special "new" post handling
- Simplify existing post loading logic
- Implement complete actions for save/delete

C. Client-side adjustments:

Update /src/routes/posts/[post_id]/+page.svelte:

- Remove isNewPost conditional logic
- Simplify UI rendering based on server-provided permissions
- Use consistent data binding for all scenarios

Benefits of This Approach:

1.  Unified Data Flow: Same code path for new and existing posts
2.  Simplified Logic: No special cases for "new" posts
3.  Consistent State: Always have real post data and ID
4.  Better UX: Immediate save capability, URL sharing
5.  Cleaner Code: Eliminates complex conditional logic

Would you like me to proceed with implementing this approach?
