export type AladhanPrayerTimesParameters = {
	[key: string]: string | number | boolean | null | undefined;
	date?: string;
	latitude: number;
	longitude: number;
	method?: number;
	shafaq?: string;
	tune?: string;
	school?: number;
	midnightMode?: number;
	timezonestring?: string;
	latitudeAdjustmentMethod?: number;
	adjustment?: number;
	iso8601?: boolean;
};
