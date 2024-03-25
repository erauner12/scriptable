export function dateToString(dateString?: Date) {
	const date = dateString ? dateString : new Date();
	return new Date(date)
		.toLocaleString(undefined, {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		})
		.replace(/\//g, "-");
}
