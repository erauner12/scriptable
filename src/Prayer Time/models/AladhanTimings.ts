import type { AladhanPrayerTime } from "src/Prayer Time/types";
import type { AladhanTimingsRequestQueryLocation } from "src/Prayer Time/types/Aladhan";
import { dateToString } from "src/Prayer Time/utilities";
import { fetchRequest } from "src/utilities/fetch";

export class AladhanTimings {
	private baseUrl: string = "http://api.aladhan.com/v1/timings";
	private parameters: AladhanTimingsRequestQueryLocation;

	constructor(parameters: AladhanTimingsRequestQueryLocation) {
		this.parameters = parameters;
	}

	async getPrayerTimes(date: Date = new Date()): Promise<AladhanPrayerTime> {
		try {
			const request = await fetchRequest(this.baseUrl, {
				...this.parameters,
				date: dateToString(date),
			});
			const response = await request.loadJSON();
			const data: AladhanPrayerTime = response.data;

			return data;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			throw new Error(`Failed to retrieve prayer times: ${errorMessage}`);
		}
	}
}
