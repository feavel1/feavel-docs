<script lang="ts">
	import {
		Calendar,
		TimeGrid,
		Interaction,
		DayGrid,
		List,
		ResourceTimeline,
		ResourceTimeGrid
	} from '@event-calendar/core';
	import type { Tables } from '$lib/types/database.types';

	// Define the component props
	let { events = [], onEventClick } = $props<{
		events?: Tables<'events'>[];
		onEventClick?: (event: Tables<'events'>) => void;
	}>();

	// Calendar plugins
	let plugins = [TimeGrid, Interaction, DayGrid, List, ResourceTimeline, ResourceTimeGrid];

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

	// Convert Supabase events to calendar events with resource support
	let calendarEvents = $derived(
		events.map((event: Tables<'events'>) => {
			const { start, end } = parseRange(event.duration);

			// Determine color based on event type
			let color = '#779ECB'; // Default color
			switch (event.event_type) {
				case 'reservation':
					color = '#FE6B64';
					break;
				case 'seminar':
					color = '#B29DD9';
					break;
				case 'availability':
					color = '#779ECB';
					break;
			}

			return {
				id: event.id,
				title: event.title,
				start: start,
				end: end,
				resourceId: event.studio_id,
				color: color,
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

	// Define hierarchical resources based on studios
	let resources = $derived([
		{ id: 1, title: 'Studio A' },
		{ id: 2, title: 'Studio B' },
		{ id: 3, title: 'Studio C' },
		{
			id: 4,
			title: 'Main Studios',
			children: [
				{ id: 5, title: 'Studio D' },
				{ id: 6, title: 'Studio E' },
				{
					id: 7,
					title: 'Premium Studios',
					children: [
						{ id: 8, title: 'Studio F' },
						{ id: 9, title: 'Studio G' },
						{
							id: 10,
							title: 'VIP Studios',
							children: [
								{ id: 11, title: 'Studio H' },
								{ id: 12, title: 'Studio I' },
								{ id: 13, title: 'Studio J' }
							]
						}
					]
				}
			]
		}
	]);

	// Handle event click
	function handleEventClick(info: any) {
		if (!onEventClick) return;

		const event = events.find((e: Tables<'events'>) => e.id === info.event.id);
		if (event) onEventClick(event);
	}

	// Calendar options
	let options = $derived({
		view: 'resourceTimeGridWeek',
		height: '800px',
		headerToolbar: {
			start: 'prev,next today',
			center: 'title',
			end: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek resourceTimeGridWeek,resourceTimelineWeek'
		},
		resources: resources,
		scrollTime: '09:00:00',
		events: calendarEvents,
		views: {
			timeGridWeek: { pointer: true },
			resourceTimeGridWeek: { pointer: true },
			resourceTimelineWeek: {
				pointer: true,
				slotMinTime: '09:00',
				slotMaxTime: '21:00',
				slotWidth: 80
			}
		},
		dayMaxEvents: true,
		nowIndicator: true,
		selectable: true,
		eventClick: handleEventClick
	});
</script>

<div class="h-full w-full text-black">
	<Calendar {plugins} {options} />
</div>
