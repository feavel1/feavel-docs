<script lang="ts">
	import EventCalendar from '$lib/components/modules/calendar/EventCalendar.svelte';
	import type { Tables } from '$lib/types/database.types';

	// Mock data that fits the current Supabase events table structure
	let mockEvents: Tables<'events'>[] = [
		{
			id: '1',
			title: 'Studio Reservation',
			description: 'Reservation for music recording session',
			duration: '[2025-09-15 10:00:00,2025-09-15 12:00:00)',
			event_type: 'reservation',
			status: 'approved',
			studio_id: 1,
			service_id: 101,
			user_id: 'user-123',
			is_public: false,
			metadata: { equipment: ['microphone', 'headphones'] } as any,
			created_at: '2025-09-01T09:00:00Z',
			updated_at: '2025-09-01T09:00:00Z'
		},
		{
			id: '2',
			title: 'Seminar: Music Production Basics',
			description: 'Introduction to music production techniques',
			duration: '[2025-09-16 14:00:00,2025-09-16 16:00:00)',
			event_type: 'seminar',
			status: 'pending',
			studio_id: 2,
			service_id: 102,
			user_id: 'user-456',
			is_public: true,
			metadata: { capacity: 20 } as any,
			created_at: '2025-09-02T10:30:00Z',
			updated_at: '2025-09-02T10:30:00Z'
		},
		{
			id: '3',
			title: 'Studio Maintenance',
			description: 'Regular equipment maintenance and calibration',
			duration: '[2025-09-17 09:00:00,2025-09-17 11:00:00)',
			event_type: 'availability',
			status: 'approved',
			studio_id: 1,
			service_id: null,
			user_id: null,
			is_public: false,
			metadata: { maintenance_type: 'equipment' } as any,
			created_at: '2025-09-03T11:15:00Z',
			updated_at: '2025-09-03T11:15:00Z'
		},
		{
			id: '4',
			title: 'Private Lesson: Guitar Techniques',
			description: 'One-on-one guitar lesson',
			duration: '[2025-09-18 15:00:00,2025-09-18 16:00:00)',
			event_type: 'reservation',
			status: 'approved',
			studio_id: 3,
			service_id: 103,
			user_id: 'user-789',
			is_public: false,
			metadata: { skill_level: 'intermediate' } as any,
			created_at: '2025-09-04T14:20:00Z',
			updated_at: '2025-09-04T14:20:00Z'
		},
		{
			id: '5',
			title: 'Open House Event',
			description: 'Studio open house for prospective clients',
			duration: '[2025-09-20 12:00:00,2025-09-20 16:00:00)',
			event_type: 'seminar',
			status: 'approved',
			studio_id: 1,
			service_id: null,
			user_id: null,
			is_public: true,
			metadata: { refreshments: true } as any,
			created_at: '2025-09-05T16:45:00Z',
			updated_at: '2025-09-05T16:45:00Z'
		}
	];

	// Handle event click
	function handleEventClick(event: Tables<'events'>) {
		console.log('Event clicked:', event);
		// You can implement navigation or a modal here
	}
</script>

<div class="p-6">
	<h1 class="text-2xl font-bold mb-6">Event Calendar</h1>
	<div class="bg-white rounded-lg shadow p-4">
		<EventCalendar events={mockEvents} onEventClick={handleEventClick} />
	</div>
</div>