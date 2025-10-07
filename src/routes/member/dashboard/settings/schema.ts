	import { z } from 'zod';

	export const settingsSchema = z.object({
		full_name: z
			.string()
			.max(20, { message: 'Full name must be less than 100 characters' })
			.nullable(),
		description: z
			.string()
			.max(100, { message: 'Description must be less than 500 characters' })
			.nullable(),
		birthday: z.string().or(z.literal('')).nullable()
	});

	export type SettingsSchema = typeof settingsSchema;