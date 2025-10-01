PROCESSED: This input has been incorporated into the project constitution (v1.2.0) at `.specify/memory/constitution.md`

Overview

This constitution establishes clear patterns for handling user sessions and Supabase clients across the application to ensure
consistency, security, and performance.

Core Principles

1.  Session and Permission Handling

- The hooks.server.ts file runs before any route code and handles all session validation and permission checks
- Protected routes like /member/dashboard and /studios/dashboard are validated at the hook level, so individual route files don't
  need to check session validity
- Example of redundant code that should be avoided:
  // DON'T DO THIS - hook already validates session
  const { session } = await safeGetSession();
  if (!session) {
  throw redirect(303, '/auth/login');
  }

2.  Parent-Child Data Flow

- Data loaded in parent +layout.server.ts files is accessible to child layouts and pages through await parent()
- The root routes/+layout.server.ts loads common data:
  {
  session, // User session data
  user, // User profile from Supabase auth
  userProfile, // Extended user profile from database
  mostUsedTags, // Cached tag data
  mostUsedCategories, // Cached category data
  cookies // All cookies
  }
- Child server files should access this data by destructuring the parent result:
  // DO THIS - access parent data efficiently
  export const load = async ({ parent }) => {
  const { session, user, userProfile } = await parent();
  // ... rest of the code
  };

3.  Supabase Client Usage

- In server files (+page.server.ts, +layout.server.ts), always use locals.supabase instead of creating new clients
- This ensures optimal performance and proper authentication context:
  // DO THIS - use locals.supabase
  export const load = async ({ locals: { supabase } }) => {
  const { data } = await supabase.from('posts').select('\*');
  return { posts: data };
  };

4.  Frontend Data Access

- The root layout (routes/+layout.svelte) receives all server-loaded data and passes it down through the component tree
- Child +page.svelte files can access inherited data directly through props:
  <!-- DO THIS - access inherited data through props -->
  <script> 
  const { data: propsData } = $props(); 
  const { userProfile, session, supabase } = propsData; 
  </script>
- This eliminates the need for redundant data fetching in individual page server files

Implementation Rules

1.  Never manually check session validity in layouts/pages - rely on hooks for authentication validation
2.  Always use await parent() to access inherited data instead of re-fetching in child routes
3.  Use locals.supabase in server files for all Supabase operations - never create new clients
4.  Access inherited data through props in Svelte components - avoid duplicate fetching of what's already available

Example Patterns

Correct Server Load Pattern

// In any +page.server.ts or +layout.server.ts (except root)
export const load = async ({ parent, locals: { supabase } }) => {
// Access inherited data from parent
const { session, user, userProfile } = await parent();

// Use locals.supabase for database operations
const { data: posts } = await supabase
.from('posts')
.select('id, title, created_at')
.eq('user_id', user.id);

return {
posts
};
};

Correct Component Pattern

 <!-- In any +page.svelte -->
 <script> 
 // Access all inherited data through props 
 const { data: propsData } = $props(); 
 const { session, user, userProfile, supabase } = propsData; 
 
 // Use the data directly without additional fetching 
 </script>
