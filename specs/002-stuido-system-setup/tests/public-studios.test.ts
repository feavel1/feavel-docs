import { describe, it, expect } from 'vitest';

describe('Public Studios API', () => {
	it('should return approved studios', async () => {
		// This test will fail because the endpoint is not implemented yet
		const response = await fetch('/studios');
		expect(response.status).toBe(200);

		const data = await response.json();
		expect(data).toHaveProperty('studios');
		expect(Array.isArray(data.studios)).toBe(true);
	});
});