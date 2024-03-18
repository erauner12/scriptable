import type { AladhanPrayerTime } from "src/Prayer Time/types";
import { dateToString } from "src/Prayer Time/utilities";
import { fetchRequest } from "src/utilities/fetch";

interface AladhanPrayerTimesParameters {
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
}

export class AladhanPrayerTimes {
	private baseUrl: string = "http://api.aladhan.com/v1/timings";

	async getPrayerTimes(
		date: Date,
		parameters: AladhanPrayerTimesParameters
	): Promise<AladhanPrayerTime> {
		const dateString = dateToString(date);
		const baseUrl = `${this.baseUrl}${dateString}`;
		const request = await fetchRequest(baseUrl, parameters);
		const response = await request.loadJSON();
		const data: AladhanPrayerTime = response.data;

		return data;
	}
}
