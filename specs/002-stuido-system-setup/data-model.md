# Data Model: Studio System

## Entities

### Studio
Represents a studio that can offer services on the platform.

**Fields**:
- `id` (number): Primary key, auto-incremented
- `name` (string): Studio name (required)
- `description` (string): Studio description (required)
- `contact_phone` (number): Studio contact phone number (required)
- `salary_expectation` (string): Studio salary expectation (required)
- `status` (enum): Studio status - one of: applied, approved, incomplete, disabled, blocked
- `user_id` (string): Foreign key to users table (required)
- `created_at` (string): Timestamp when studio was created

**Relationships**:
- One-to-one with User (via user_id)
- One-to-many with Services (via created_by in services table)
- One-to-many with Events (via studio_id in events table)

**Validation Rules**:
- name: Required, max 100 characters
- description: Required, max 500 characters
- contact_phone: Required, valid phone number format
- salary_expectation: Required, max 100 characters
- status: Required, must be one of the defined enum values
- user_id: Required, must reference an existing user

### User
Represents a platform user.

**Fields** (inherited from existing schema):
- `id` (string): Primary key (UUID)
- `full_name` (string): User's full name (nullable)
- `username` (string): User's username (nullable)
- `avatar_url` (string): URL to user's avatar image (nullable)
- `birthday` (string): User's birthday (nullable)
- `description` (string): User's description (nullable)

**Relationships**:
- One-to-one with Studio (via user_id in studios table)

## State Transitions

### Studio Status Transitions
1. `applied` → `approved`: When admin approves the studio application
2. `applied` → `incomplete`: When additional information is needed from the studio
3. `applied` → `blocked`: When the application is rejected
4. `approved` → `disabled`: When the studio is temporarily disabled
5. `approved` → `blocked`: When the studio is permanently blocked
6. `disabled` → `approved`: When a disabled studio is re-enabled
7. `incomplete` → `applied`: When the studio provides the missing information

## Queries

### Public Studios Query
Get all studios with status "approved" for display on the landing page.

```sql
SELECT id, name, description
FROM studios
WHERE status = 'approved'
ORDER BY created_at DESC
```

### User Studio Query
Get the studio associated with a specific user.

```sql
SELECT id, name, description, status
FROM studios
WHERE user_id = $1
```

### Studio Application Check
Check if a user has already applied to become a studio.

```sql
SELECT COUNT(*) as count
FROM studios
WHERE user_id = $1
```