import { z } from 'zod/v4';

export const settingsSchema = z.object({
	full_name: z
		.string()
		.max(100, { message: 'Full name must be less than 100 characters' })
		.nullable(),
	description: z
		.string()
		.max(500, { message: 'Description must be less than 500 characters' })
		.nullable(),
	birthday: z.string().nullable()
});

export type SettingsSchema = typeof settingsSchema;
