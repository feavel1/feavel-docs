<script lang="ts">
	import { Calendar, TimeGrid, Interaction, DayGrid, List } from '@event-calendar/core';
	import type { Tables } from '$lib/types/database.types';

	// Define the component props
	let { events = [], onEventClick } = $props<{
		events?: Tables<'events'>[];
		onEventClick?: (event: Tables<'events'>) => void;
	}>();

	// Calendar plugins
	let plugins = [TimeGrid, Interaction, DayGrid, List];

	// Helper function to parse PostgreSQL range type
	function parseRange(duration: unknown): { start: string; end: string } {
		try {
			const durationStr = String(duration);
			const matches = durationStr.match(/\[(.*?),(.*?)\)/);

			if (matches && matches.length >= 3) {
				// Convert PostgreSQL timestamp format to ISO format
				const start = matches[1].replace(' ', 'T') + 'Z';
				const end = matches[2].replace(' ', 'T') + 'Z';
				return { start, end };
			}
		} catch (e) {
			console.error('Error parsing range:', e);
		}

		// Fallback for mock data or if parsing fails
		const now = new Date();
		return {
			start: now.toISOString(),
			end: new Date(now.getTime() + 3600000).toISOString() // +1 hour
		};
	}

	// Convert Supabase events to calendar events
	let calendarEvents = $derived(
		events.map((event: Tables<'events'>) => {
			const { start, end } = parseRange(event.duration);

			return {
				id: event.id,
				title: event.title,
				start: start,
				end: end,
				// You can add more properties based on event data
				extendedProps: {
					description: event.description,
					event_type: event.event_type,
					status: event.status,
					studio_id: event.studio_id,
					service_id: event.service_id
				}
			};
		})
	);

	// Handle event click
	function handleEventClick(info: any) {
		if (!onEventClick) return;

		const event = events.find((e: Tables<'events'>) => e.id === info.event.id);
		if (event) onEventClick(event);
	}

	// Calendar options
	let options = $derived({
		view: 'timeGridWeek',
		height: '800px',
		headerToolbar: {
			start: 'prev,next today',
			center: 'title',
			end: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
		},
		scrollTime: '09:00:00',
		events: calendarEvents,
		dayMaxEvents: true,
		nowIndicator: true,
		selectable: true,
		eventClick: handleEventClick
	});
</script>

<div class="h-full w-full text-black">
	<Calendar {plugins} {options} />
</div>
