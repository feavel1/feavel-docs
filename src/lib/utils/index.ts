export function handleError(error: unknown, context = ''): void {
	console.error(`[Error]${context ? ' [' + context + ']' : ''}:`, error);
}
