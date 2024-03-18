import type { AladhanPrayerTime } from "src/Prayer Time/types";
import type { AladhanTimingsRequestQueryLocation } from "src/Prayer Time/types/Aladhan";
import { dateToString } from "src/Prayer Time/utilities";
import { fetchRequest } from "src/utilities/fetch";

export class AladhanTimings {
	private baseUrl: string = "http://api.aladhan.com/v1/timings";

	async getPrayerTimes(
		date: Date,
		parameters: AladhanTimingsRequestQueryLocation
	): Promise<AladhanPrayerTime> {
		const dateString = dateToString(date);
		const baseUrl = `${this.baseUrl}${dateString}`;
		const request = await fetchRequest(baseUrl, parameters);
		const response = await request.loadJSON();
		const data: AladhanPrayerTime = response.data;

		return data;
	}
}
