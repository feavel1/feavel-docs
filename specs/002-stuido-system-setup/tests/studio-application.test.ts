import { describe, it, expect } from 'vitest';

describe('Studio Application API', () => {
	it('should accept valid studio application', async () => {
		// This test will fail because the endpoint is not implemented yet
		const studioData = {
			name: 'Test Studio',
			description: 'A test studio for validation purposes',
			contact_phone: 1234567890,
			salary_expectation: '$50,000 - $70,000'
		};

		const response = await fetch('/studios/apply', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(studioData)
		});

		expect(response.status).toBe(201);

		const data = await response.json();
		expect(data).toHaveProperty('message');
		expect(data).toHaveProperty('studio');
		expect(data.studio.name).toBe(studioData.name);
		expect(data.studio.status).toBe('applied');
	});

	it('should reject duplicate studio applications', async () => {
		// This test will fail because the endpoint is not implemented yet
		const studioData = {
			name: 'Test Studio 2',
			description: 'Another test studio',
			contact_phone: 1234567891,
			salary_expectation: '$60,000 - $80,000'
		};

		// First application
		await fetch('/studios/apply', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(studioData)
		});

		// Second application (should fail)
		const response = await fetch('/studios/apply', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(studioData)
		});

		expect(response.status).toBe(409);
	});
});
