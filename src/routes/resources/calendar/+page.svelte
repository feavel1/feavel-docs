<script lang="ts">
	import EventCalendar from '$lib/components/modules/calendar/EventCalendar.svelte';
	import type { Tables } from '$lib/types/database.types';

	// Mock data that fits the current Supabase events table structure
	let mockEvents: Tables<'events'>[] = [
		{
			id: '1',
			title: 'Studio Reservation',
			description: 'Reservation for music recording session',
			duration: '[2025-08-31 10:00:00,2025-08-31 12:00:00)',
			event_type: 'reservation',
			status: 'approved',
			studio_id: 1,
			service_id: 101,
			user_id: 'user-123',
			is_public: false,
			metadata: { equipment: ['microphone', 'headphones'] } as any,
			created_at: '2025-08-25T09:00:00Z',
			updated_at: '2025-08-25T09:00:00Z'
		},
		{
			id: '2',
			title: 'Seminar: Music Production Basics',
			description: 'Introduction to music production techniques',
			duration: '[2025-09-01 14:00:00,2025-09-01 16:00:00)',
			event_type: 'seminar',
			status: 'pending',
			studio_id: 2,
			service_id: 102,
			user_id: 'user-456',
			is_public: true,
			metadata: { capacity: 20 } as any,
			created_at: '2025-08-26T10:30:00Z',
			updated_at: '2025-08-26T10:30:00Z'
		},
		{
			id: '3',
			title: 'Studio Maintenance',
			description: 'Regular equipment maintenance and calibration',
			duration: '[2025-09-02 09:00:00,2025-09-02 11:00:00)',
			event_type: 'availability',
			status: 'approved',
			studio_id: 1,
			service_id: null,
			user_id: null,
			is_public: false,
			metadata: { maintenance_type: 'equipment' } as any,
			created_at: '2025-08-27T11:15:00Z',
			updated_at: '2025-08-27T11:15:00Z'
		},
		{
			id: '4',
			title: 'Private Lesson: Guitar Techniques',
			description: 'One-on-one guitar lesson',
			duration: '[2025-09-03 15:00:00,2025-09-03 16:00:00)',
			event_type: 'reservation',
			status: 'approved',
			studio_id: 3,
			service_id: 103,
			user_id: 'user-789',
			is_public: false,
			metadata: { skill_level: 'intermediate' } as any,
			created_at: '2025-08-28T14:20:00Z',
			updated_at: '2025-08-28T14:20:00Z'
		},
		{
			id: '5',
			title: 'Open House Event',
			description: 'Studio open house for prospective clients',
			duration: '[2025-09-05 12:00:00,2025-09-05 16:00:00)',
			event_type: 'seminar',
			status: 'approved',
			studio_id: 1,
			service_id: null,
			user_id: null,
			is_public: true,
			metadata: { refreshments: true } as any,
			created_at: '2025-08-30T16:45:00Z',
			updated_at: '2025-08-30T16:45:00Z'
		},
		{
			id: '6',
			title: 'Recording Session',
			description: 'Professional recording session',
			duration: '[2025-09-01 10:00:00,2025-09-01 14:00:00)',
			event_type: 'reservation',
			status: 'approved',
			studio_id: 5,
			service_id: 104,
			user_id: 'user-101',
			is_public: false,
			metadata: { engineer: 'John Doe' } as any,
			created_at: '2025-08-27T09:30:00Z',
			updated_at: '2025-08-27T09:30:00Z'
		},
		{
			id: '7',
			title: 'Music Workshop',
			description: 'Advanced music composition workshop',
			duration: '[2025-09-02 13:00:00,2025-09-02 17:00:00)',
			event_type: 'seminar',
			status: 'approved',
			studio_id: 7,
			service_id: 105,
			user_id: 'user-202',
			is_public: true,
			metadata: { instructor: 'Jane Smith' } as any,
			created_at: '2025-08-28T11:15:00Z',
			updated_at: '2025-08-28T11:15:00Z'
		},
		{
			id: '8',
			title: 'VIP Client Session',
			description: 'Exclusive recording session for VIP client',
			duration: '[2025-09-03 18:00:00,2025-09-03 22:00:00)',
			event_type: 'reservation',
			status: 'approved',
			studio_id: 10,
			service_id: 106,
			user_id: 'user-303',
			is_public: false,
			metadata: { amenities: ['champagne', 'catering'] } as any,
			created_at: '2025-08-29T15:45:00Z',
			updated_at: '2025-08-29T15:45:00Z'
		},
		{
			id: '9',
			title: 'Studio Calibration',
			description: 'Professional audio equipment calibration',
			duration: '[2025-09-04 09:00:00,2025-09-04 12:00:00)',
			event_type: 'availability',
			status: 'approved',
			studio_id: 8,
			service_id: null,
			user_id: null,
			is_public: false,
			metadata: { technician: 'AudioTech Inc.' } as any,
			created_at: '2025-08-30T10:20:00Z',
			updated_at: '2025-08-30T10:20:00Z'
		},
		{
			id: '10',
			title: 'Masterclass: Jazz Improvisation',
			description: 'Advanced jazz improvisation techniques',
			duration: '[2025-09-06 16:00:00,2025-09-06 19:00:00)',
			event_type: 'seminar',
			status: 'approved',
			studio_id: 12,
			service_id: 107,
			user_id: 'user-404',
			is_public: true,
			metadata: { prerequisites: 'Intermediate jazz theory' } as any,
			created_at: '2025-08-31T12:30:00Z',
			updated_at: '2025-08-31T12:30:00Z'
		}
	];

	// Handle event click
	function handleEventClick(event: Tables<'events'>) {
		console.log('Event clicked:', event);
		// You can implement navigation or a modal here
	}
</script>

<div class="p-6">
	<div class="rounded-lg bg-white p-4 shadow">
		<EventCalendar events={mockEvents} onEventClick={handleEventClick} />
	</div>
</div>
