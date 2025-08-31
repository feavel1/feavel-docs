Setup:
main calendar page: src/routes/resources/calendar/+page.svelte
calendar modules: src/lib/components/modules/calendar/

1. Database Schema Design

- Create events table to store all calendar events
- Add fields for event type (reservation, availability, seminar, etc.)
- Include status field for approval workflow (pending, approved, rejected, canceled)
- Link events to services and studios
- Use PostgreSQL range types (tstzrange) for efficient time-based queries

2. Service Integration

- Create a new services table to support reservation types based on the older service table.
- Add a field to distinguish between single download, reservation, and package delivery services
- new service.description should be jsonb to support current text editor
- Create relationships between services and events (create a new table)

<!-- 3. Calendar Implementation

- Keep the existing EventCalendar component for detailed views
- Implement a simpler availability calendar using shadcn-svelte components for
  studio owners
- Create both studio-specific and unified public calendar views

4. Reservation Workflow

- Implement a request/approval system for reservations
- Allow automatic confirmation for free events
- Enable studio owners to approve/reject reservation requests
- Support user cancellation and modification requests

5. Privacy & Access Control

- Show anonymous "busy" blocks on public calendars
- Display full details only to studio owners
- Implement proper RLS (Row Level Security) policies

Implementation Steps

1. Design and create the necessary database tables with range types
2. Implement backend utilities for event management
3. Create studio availability management interface
4. Build reservation request and approval workflows
5. Develop both studio-specific and public calendar views
6. Implement proper access controls and privacy features

Would you like me to proceed with any specific part of this plan? -->
