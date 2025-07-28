import { z } from 'zod';

export const formSchema = z.object({
	username: z
		.string()
		.min(3, { message: 'Username must be at least 3 characters' })
		.max(20, { message: 'Username must be less than 20 characters' })
		.regex(/^[a-zA-Z0-9_-]+$/, {
			message: 'Username can only contain letters, numbers, underscores, and hyphens'
		}),
	email: z.string().email({ message: 'Please enter a valid email address' }),
	password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});

export type FormSchema = typeof formSchema;
