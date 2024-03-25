import { AladhanTimings } from "src/Prayer Time/models/AladhanTimings";
import { PrayerTimeFileSystem } from "src/Prayer Time/models/PrayerTime/PrayerTimeFileSystem";
import type { AladhanPrayerTime, WidgetPreferences } from "src/Prayer Time/types";
import type { AladhanTimingsMethodValues } from "src/Prayer Time/types/AladhanTimings";
import type { DeepPartial } from "src/types/helpers";
import { handleError } from "src/utilities/handleError";

export class PrayerTimeAPI extends PrayerTimeFileSystem {
	constructor(userPreferences: DeepPartial<WidgetPreferences>) {
		super(userPreferences);
	}

	protected async isOnline(): Promise<boolean> {
		const waitTimeMs = 15;
		const url = "https://www.google.com";
		const request = new Request(url);
		request.method = "HEAD";
		request.timeoutInterval = waitTimeMs / 60;

		try {
			const response = await request.load();
			console.log(response);
			if (response) return true;
			return false;
		} catch (error) {
			return false;
		}
	}

	protected async getAladhanTimings(
		method: AladhanTimingsMethodValues,
		location: Location.CurrentLocation,
		numberOfDays: number,
	): Promise<AladhanPrayerTime[]> {
		try {
			const { latitude, longitude } = location;
			const newData: AladhanPrayerTime[] = [];

			const aladhanTimings = new AladhanTimings({
				latitude,
				longitude,
				method,
			});

			for (let day = 0; day < numberOfDays; day++) {
				const date = new Date();
				date.setDate(date.getDate() + day);

				const aladhanPrayerTimeData = await aladhanTimings.getPrayerTimes(date);
				newData.push(aladhanPrayerTimeData);
			}

			return this.mergeAladhanPrayerTimes(newData, numberOfDays);
		} catch (error) {
			throw handleError(error);
		}
	}

	private async mergeAladhanPrayerTimes(newData: AladhanPrayerTime[], offlineDays: number): Promise<AladhanPrayerTime[]> {
		const mergedData: AladhanPrayerTime[] = [];

		if (this.preferences.data.prayerTimes) {
			this.removeDuplicateData(this.preferences.data.prayerTimes).filter(
				({
					date: {
						gregorian: { date },
					},
				}) => {
					const today = new Date();
					today.setHours(0, 0, 0, 0);
					const max = new Date(today);
					max.setDate(today.getDate() + offlineDays);
					const isGreaterOrEqualToToday = this.stringToDate(date) >= today;
					const isLessOrEqualToMax = this.stringToDate(date) <= max;
					const isInRange = isGreaterOrEqualToToday && isLessOrEqualToMax;
					return isInRange;
				},
			);
		}

		// Update merged `day` values if already exist, else add new `days`
		newData.forEach((day: AladhanPrayerTime) => {
			const existsAlready = mergedData.some((d) => {
				return JSON.stringify(d) === JSON.stringify(day);
			});

			// Add to offline if it doesn't exist
			if (existsAlready === false) {
				const indexToReplace = mergedData.findIndex(
					({
						date: {
							gregorian: { date },
						},
					}) => {
						return day.date.gregorian.date === date;
					},
				);

				if (indexToReplace >= 0) {
					mergedData[indexToReplace] = day;
				}

				if (indexToReplace === -1) {
					mergedData.push(day);
				}
			}
		});

		// Sort array in ascending order by date
		mergedData.sort((a, b) => {
			const dateA = new Date(a.date.gregorian.date);
			const dateB = new Date(b.date.gregorian.date);
			if (dateA < dateB) {
				return -1;
			}
			if (dateA > dateB) {
				return 1;
			}
			return 0;
		});

		return mergedData;
	}

	private removeDuplicateData(array: AladhanPrayerTime[]): AladhanPrayerTime[] {
		const newArray: AladhanPrayerTime[] = [];
		array.forEach((object) => {
			if (!newArray.some((o) => JSON.stringify(o) === JSON.stringify(object))) {
				newArray.push(object);
			}
		});
		return newArray;
	}
}
