export function getDaysBetweenDates(date1: Date, date2: Date): number {
	const _date1 = new Date(date1);
	const _date2 = new Date(date2);
	const differenceInTime = _date2.getTime() - _date1.getTime();
	const differenceInDays = differenceInTime / (1000 * 60 * 60 * 24);
	return Math.abs(differenceInDays);
}
