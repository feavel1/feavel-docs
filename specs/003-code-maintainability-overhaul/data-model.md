# Data Model: Code Maintainability Overhaul

## Entities

### User Profile

**Description**: Contains user information and associated studio data
**Fields**:

- id: string (UUID)
- username: string
- avatar_url: string (nullable)
- created_at: timestamp
- studio: StudioApplication (embedded object, nullable)

### Studio Application

**Description**: Contains studio application status and related information
**Fields**:

- id: string (UUID)
- user_id: string (UUID, foreign key to users)
- name: string
- description: string
- contact_phone: number
- salary_expectation: string
- status: string (enum: 'applied', 'approved', 'incomplete', 'disabled', 'blocked')
- created_at: timestamp
- updated_at: timestamp

### Utility Functions (to be removed)

**Description**: Collection of helper functions used throughout the application that will be inlined or removed
**Fields**:

- function_name: string
- complexity: string (enum: 'trivial', 'moderate', 'complex')
- usage_count: number
- file_location: string

## Relationships

- User Profile 1:1 Studio Application (through user_id)
- Utility Functions are not entities but code artifacts to be refactored

## Validation Rules

1. UserProfile.studio.status must be one of: 'applied', 'approved', 'incomplete', 'disabled', 'blocked'
2. StudioApplication.user_id must reference a valid user
3. Utility functions with complexity 'trivial' and usage_count <= 1 should be candidates for removal

## State Transitions

### Studio Application Status

- applied → approved (upon review and approval)
- applied → incomplete (when application is missing required information)
- applied → disabled (when user disables their application)
- approved → blocked (when admin blocks approved studio)
- incomplete → applied (when user completes missing information)
- disabled → applied (when user re-enables their application)
- blocked → approved (when admin unblocks studio)
