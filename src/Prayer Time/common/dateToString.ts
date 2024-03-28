export function dateToString(date: Date) {
	return new Date(date)
		.toLocaleString(undefined, {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		})
		.replace(/\//g, "-");
}
