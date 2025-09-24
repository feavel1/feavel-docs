# Data Model: Services Page Pagination

## Entities

### Service
Represents a studio service with the following attributes:
- `id`: Unique identifier for the service
- `name`: Name of the service
- `price`: Price of the service
- `cover_url`: URL to the service cover image
- `highlights`: Array of service highlights
- `service_type`: Type of service
- `status`: Current status of the service
- `created_at`: Timestamp when the service was created
- `created_by`: ID of the user who created the service
- `studios`: Related studio information
- `services_category_rel`: Related category information

### ServiceCategory
Represents a category that services can be grouped by:
- `id`: Unique identifier for the category
- `category_name`: Name of the category

## State Management

### ServicesPageState
Represents the state of the services page component:
- `searchQuery`: Current search query string
- `selectedCategories`: Array of selected category IDs
- `sortBy`: Current sort order (newest, price_low, price_high)
- `allServices`: Array of all loaded services
- `displayedServices`: Array of currently displayed services (after filtering)
- `loading`: Boolean indicating if initial data is loading
- `loadingMore`: Boolean indicating if more services are loading
- `hasMoreServices`: Boolean indicating if more services are available
- `offset`: Current offset for pagination
- `allCategories`: Array of all available categories

## Relationships
- A Service belongs to one or more ServiceCategories through services_category_rel
- A Service is created by a User (created_by)
- A Service belongs to a Studio (studios)