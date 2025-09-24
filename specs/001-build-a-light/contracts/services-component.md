# Services Component Contract

## Component Interface

### Props
- `supabase`: SupabaseClient - The Supabase client instance
- `servicesPerPage` (optional): number - Number of services to load per batch (default: 9)
- `initialServices`: Array - Initial services to display
- `initialCategories`: Array - Initial categories for filtering

### Events
- `servicesloaded`: Emitted when services are loaded
- `servicesloading`: Emitted when services are loading
- `error`: Emitted when an error occurs

### Methods
- `loadMoreServices()`: Function to load more services
- `refreshServices()`: Function to refresh all services

## Data Flow

### Initial Load
1. Component mounts
2. Fetch initial 9 services from Supabase
3. Fetch all categories for filtering
4. Render services and filters

### Load More
1. User clicks "Load More" button
2. Fetch next batch of services from Supabase
3. Append to existing services
4. Update hasMore flag

### Filtering
1. User changes search query or categories
2. Reset pagination (offset = 0)
3. Fetch filtered services from Supabase
4. Update displayed services

### Sorting
1. User changes sort option
2. Reset pagination (offset = 0)
3. Fetch sorted services from Supabase
4. Update displayed services

## State Management
- `offset`: Tracks current pagination position
- `loading`: Indicates if initial data is loading
- `loadingMore`: Indicates if more services are loading
- `hasMoreServices`: Indicates if more services are available
- `allServices`: Stores all loaded services
- `displayedServices`: Stores currently displayed services (after filtering)