import { dateToString } from "src/Prayer Time/common/dateToString";
import type { AladhanPrayerTime } from "src/Prayer Time/types";
import type { AladhanTimingsRequestQueryLocation } from "src/Prayer Time/types/AladhanTimings";
import { fetchRequest } from "src/utilities";

export class AladhanTimings {
	private baseUrl: string = "http://api.aladhan.com/v1/timings";
	private parameters: AladhanTimingsRequestQueryLocation;

	constructor(parameters: AladhanTimingsRequestQueryLocation) {
		this.parameters = parameters;
	}

	async getPrayerTimes(date?: Date): Promise<AladhanPrayerTime> {
		try {
			const dateString = dateToString(date);
			const baseUrl = `${this.baseUrl}/${dateString}`;

			const response = await fetchRequest(
				baseUrl,
				async (request) => await request.loadJSON(),
				(response) => {
					throw new Error(response.data);
				},
				this.parameters,
			);

			const data: AladhanPrayerTime = response.data;
			return data;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			throw new Error(`Failed to retrieve prayer times: ${errorMessage}`);
		}
	}
}
