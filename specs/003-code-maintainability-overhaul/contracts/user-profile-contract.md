# User Profile Data Consolidation Contract

## Endpoint

GET /api/user/profile

## Description

Consolidated endpoint to fetch user profile data including studio application information in a single query.

## Request

No parameters required - user identity derived from session.

## Response

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "avatar_url": "string|null",
      "created_at": "timestamp",
      "studio": {
        "id": "uuid",
        "user_id": "uuid",
        "name": "string",
        "description": "string",
        "contact_phone": "number",
        "salary_expectation": "string",
        "status": "applied|approved|incomplete|disabled|blocked",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }|null
    }
  },
  "error": "null|error_object"
}
```

## Error Responses

- 401: Unauthorized - No valid session
- 500: Internal server error - Database query failed
