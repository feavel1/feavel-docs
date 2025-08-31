# Calendar Database Schema Implementation

This document describes the new database schema implemented for the calendar system.

## Overview

The calendar system has been implemented with the following new tables:

1. `events` - New table to store all calendar events with PostgreSQL range types
2. `services_v2` - New table to support reservation types

## Database Changes

### Services V2 Table

The `services_v2` table has been created with:

1. **id**: SERIAL primary key
2. **created_at**: Timestamp with default NOW()
3. **created_by**: INTEGER NOT NULL REFERENCES studios(id)
4. **name**: VARCHAR(255) NOT NULL
5. **description**: JSONB
6. **price**: DECIMAL(10, 2) NOT NULL
7. **service_type**: VARCHAR(50) NOT NULL DEFAULT 'single_download'
8. **enabled**: BOOLEAN DEFAULT true
9. **status**: VARCHAR(50)
10. **cover_url**: TEXT
11. **highlights**: JSONB

### Events Table

The `events` table has been created with:

1. **id**: UUID primary key with default gen_random_uuid()
2. **created_at**: Timestamp with default NOW()
3. **updated_at**: Timestamp with default NOW()
4. **title**: VARCHAR(255) NOT NULL
5. **description**: TEXT
6. **duration**: TSTZRANGE NOT NULL (PostgreSQL range type for efficient queries)
7. **event_type**: VARCHAR(50) NOT NULL DEFAULT 'other'
8. **status**: VARCHAR(50) NOT NULL DEFAULT 'pending'
9. **studio_id**: INTEGER NOT NULL REFERENCES studios(id)
10. **service_id**: INTEGER REFERENCES services_v2(id) (Direct foreign key relationship)
11. **user_id**: UUID REFERENCES auth.users(id)
12. **is_public**: BOOLEAN DEFAULT false
13. **metadata**: JSONB
14. **exclude_studio_events**: Exclusion constraint to prevent overlapping events for the same studio

The `duration` column uses PostgreSQL's TSTZRANGE type which provides:

- Efficient range queries using operators like `&&` (overlaps)
- Built-in exclusion constraints to prevent overlapping reservations
- Eliminates the need for separate start_time and end_time columns

The direct foreign key relationship between events and services_v2 (one-to-many) correctly models that:

- One service can be associated with multiple events
- Each event is associated with at most one service

### Indexes

The following indexes have been added for better performance:

- `idx_events_duration`: GIST index on events.duration for efficient range queries
- `idx_events_studio_id`: Index on events.studio_id
- `idx_events_service_id`: Index on events.service_id
- `idx_events_user_id`: Index on events.user_id
- `idx_events_status`: Index on events.status
- `idx_events_event_type`: Index on events.event_type
- `idx_events_is_public`: Index on events.is_public
- `idx_services_v2_created_by`: Index on services_v2.created_by
- `idx_services_v2_service_type`: Index on services_v2.service_type

## Migration

The changes are implemented in the migration file:
`supabase/migrations/20250831000000_calendar_enhancements.sql`

This migration:

1. Enables the btree_gist extension required for exclusion constraints
2. Creates the new tables with the correct relationship structure
3. Adds exclusion constraints to prevent overlapping events
4. Adds the necessary indexes
5. Adds comments for documentation

## Type Definitions

The TypeScript types have been updated in `src/lib/types/database.types.ts` to reflect these changes:

- Added the new `services_v2` table definition
- Updated the `events` table definition to use `duration` instead of `start_time`, `end_time`, and `time_range`
- Created a direct foreign key relationship between events and services_v2

## Postgres gist operators

Operator Description Example Result
= equal int4range(1,5) = '[1,4]'::int4range t
<> not equal numrange(1.1,2.2) <> numrange(1.1,2.3) t
< less than int4range(1,10) < int4range(2,3) t

>     greater than	int4range(1,10) > int4range(1,5)	t
>
> <= less than or equal numrange(1.1,2.2) <= numrange(1.1,2.2) t
> = greater than or equal numrange(1.1,2.2) >= numrange(1.1,2.0) t
> @> contains range int4range(2,4) @> int4range(2,3) t
> @> contains element '[2011-01-01,2011-03-01)'::tsrange @> '2011-01-10'::timestamp t
> <@ range is contained by int4range(2,4) <@ int4range(1,7) t
> <@ element is contained by 42 <@ int4range(1,7) f
> && overlap (have points in common) int8range(3,7) && int8range(4,12) t
> << strictly left of int8range(1,10) << int8range(100,110) t
>
> >     strictly right of	int8range(50,60) >> int8range(20,30)	t
> >
> > &< does not extend to the right of int8range(1,20) &< int8range(18,20) t
> > &> does not extend to the left of int8range(7,20) &> int8range(5,10) t
> > -|- is adjacent to numrange(1.1,2.2) -|- numrange(2.2,3.3) t

- union numrange(5,15) + numrange(10,20) [5,20)

* intersection int8range(5,15) \* int8range(10,20) [10,15)

- difference int8range(5,15) - int8range(10,20) [5,10)
