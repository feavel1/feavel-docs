/**
 * Validate if a string is a valid UUID format
 * @param uuid The string to validate
 * @returns boolean indicating if the string is a valid UUID
 */
export function isValidUUID(uuid: any) {
	if (!uuid) return false;

	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(uuid);
}

/**
 * Validate if a string is a valid UUID format and return an error message if not
 * @param uuid The string to validate
 * @param fieldName The name of the field being validated (for error messages)
 * @returns null if valid, error message if invalid
 */
export function validateUUID(uuid: any, fieldName: any = 'ID') {
	if (!uuid) return null; // Null values are considered valid

	if (!isValidUUID(uuid)) {
		return `Invalid ${fieldName} format`;
	}

	return null;
}