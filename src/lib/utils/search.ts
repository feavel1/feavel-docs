export function highlightSearchTerm(text: string, query: string): string {
	if (!query.trim()) return text;

	const regex = new RegExp(`(${query})`, 'gi');
	return text.replace(regex, '<mark>$1</mark>');
}
