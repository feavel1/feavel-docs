# Code Patterns Requiring Refactoring

## 1. Posts System

### Current Complexity Issues

#### Complex Server Queries

File: `src/routes/posts/+page.server.ts`

- Fetches drafts with complex joins for user and tag information
- Repetitive query patterns across different post routes

#### Redundant Tag Operations

File: `src/lib/utils/posts.ts`

- `fetchAllTags` function calls `getTags` from tags utility
- Tag fetching logic duplicated in multiple places

#### Data Processing Logic

File: `src/lib/utils/posts.ts`

- `filterPosts` function with complex filtering logic
- `getReadingTime` function with content parsing

### Refactoring Opportunities

#### Remote Functions to Create

1. `getDrafts()` - Move draft fetching logic to remote function
2. `getAllTags()` - Centralize tag fetching
3. `filterPostsRemote()` - Move filtering logic to server
4. `getPostById()` - Consolidate post fetching logic

## 2. Services System

### Current Complexity Issues

#### Category Fetching Duplication

File: `src/routes/services/+page.server.ts`

- Direct Supabase query for categories
- Similar pattern in other service-related routes

#### File Handling Complexity

File: `src/routes/services/[service_id]/+page.server.ts`

- Complex logic for extracting file information from joined data
- Purchase verification logic mixed with data fetching

### Refactoring Opportunities

#### Remote Functions to Create

1. `getServiceCategories()` - Centralize category fetching
2. `getServiceById()` - Consolidate service data fetching
3. `checkServiceAccess()` - Move purchase verification to remote function
4. `getServiceFiles()` - Simplify file information extraction

## 3. Chat System

### Current Complexity Issues

#### Mixed Client/Server Logic

File: `src/lib/utils/chatUtils.ts`

- All chat operations in one utility file
- Real-time subscription logic mixed with data operations

#### Rate Limiting Implementation

- In-memory rate limiting store that doesn't persist across requests
- Rate limiting logic mixed with message sending

#### Complex Subscription Patterns

- Multiple subscription functions with similar patterns
- Cleanup logic scattered across functions

### Refactoring Opportunities

#### Remote Functions to Create

1. `getUserConversations()` - Fetch user conversations
2. `getConversationMessages()` - Get messages for a conversation
3. `sendMessage()` - Send a new message with rate limiting
4. `createGroupChat()` - Create new group conversations
5. `joinGroupChat()` - Join existing group conversations

## 4. General Data Access Patterns

### Current Complexity Issues

#### Repetitive Error Handling

- Similar error handling patterns across all utility functions
- Console error logging duplicated in multiple places

#### Type Safety Issues

- Use of `any` type in several places
- Type casting without proper validation

#### Parameter Validation

- Validation logic scattered across functions
- Inconsistent validation approaches

### Refactoring Opportunities

#### Remote Functions to Create

1. `validateInput()` - Centralize input validation
2. `handleDatabaseError()` - Standardize error handling
3. `paginateResults()` - Implement consistent pagination

## 5. Navigation System

### Current Implementation (Good Reference)

File: `src/lib/components/modules/navigation/Navigation.svelte`

- Uses remote functions for data fetching
- Clean separation of concerns
- Proper async/await usage

### Patterns to Replicate

1. Component-level data fetching with remote functions
2. Error handling with fallback UI
3. Type-safe remote function usage

## Priority Refactoring Areas

### High Priority (Immediate Refactoring)

1. Posts system - Complex queries and repetitive patterns
2. Services system - Category fetching and file handling
3. Chat system - Mixed client/server logic

### Medium Priority (Secondary Refactoring)

1. General utility functions - Error handling and validation
2. Data processing functions - Reading time, filtering

### Low Priority (Later Refactoring)

1. Simple data fetching functions that are already clean
2. Functions with minimal complexity

## Implementation Approach

### Step 1: Posts System Refactoring

1. Create `src/lib/remote/posts.remote.ts`
2. Move tag-related functions to `src/lib/remote/tags.remote.ts`
3. Update post route files to use remote functions
4. Simplify post utility functions

### Step 2: Services System Refactoring

1. Create `src/lib/remote/services.remote.ts`
2. Move category functions to remote file
3. Implement service access check remote function
4. Update service route files

### Step 3: Chat System Refactoring

1. Create `src/lib/remote/chat.remote.ts` (already exists but needs implementation)
2. Move chat operations to remote functions
3. Simplify chat utility functions
4. Update chat components

## Expected Benefits

### Code Reduction

- Eliminate repetitive query patterns
- Reduce utility function complexity
- Consolidate data fetching logic

### Performance Improvements

- Better SSR with remote functions
- Reduced client-side data processing
- Improved caching opportunities

### Maintainability

- Clearer separation of concerns
- Easier testing of data access patterns
- Better error handling consistency
