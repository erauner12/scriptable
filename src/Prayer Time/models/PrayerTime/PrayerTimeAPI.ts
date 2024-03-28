import { AladhanTimings } from "src/Prayer Time/models/AladhanTimings";
import { PrayerTimeFileSystem } from "src/Prayer Time/models/PrayerTime/PrayerTimeFileSystem";
import type { AladhanPrayerTime, WidgetPreferences } from "src/Prayer Time/types";
import type { DeepPartial } from "src/types/helpers";
import { handleError } from "src/utilities";

export class PrayerTimeAPI extends PrayerTimeFileSystem {
	constructor(userPreferences?: DeepPartial<WidgetPreferences>) {
		super(userPreferences);
	}

	protected async fetchPrayerTimes(location: { latitude: number; longitude: number }): Promise<AladhanPrayerTime[]> {
		try {
			const { latitude, longitude } = location;
			const newPrayerTimes: AladhanPrayerTime[] = [];

			const aladhanTimings = new AladhanTimings({
				latitude,
				longitude,
				method: this.preferences.user.aladhan.method,
			});

			for (let day = 0; day < this.preferences.user.offlineDays; day++) {
				const date = new Date();
				date.setDate(date.getDate() + day);

				const aladhanPrayerTimeData = await aladhanTimings.getPrayerTime(date);
				newPrayerTimes.push(aladhanPrayerTimeData);
			}

			return this.mergeAndSortPrayerTimes(newPrayerTimes, this.preferences.data.prayerTimes, this.preferences.user.offlineDays);
		} catch (error) {
			throw handleError(error);
		}
	}

	private mergeAndSortPrayerTimes(
		newPrayerTimes: AladhanPrayerTime[],
		existingPrayerTimes: AladhanPrayerTime[] | undefined,
		offlineDays: number,
	): AladhanPrayerTime[] {
		const mergedAndSortedPrayerTimes: AladhanPrayerTime[] = [];

		if (existingPrayerTimes) {
			const deduplicatedPrayerTimes = this.removeDuplicates(existingPrayerTimes);
			const filteredPrayerTimes = this.filterPrayerTimesByDateRange(deduplicatedPrayerTimes, offlineDays);
			const mergedPrayerTimes = this.mergeAndReplacePrayerTimes(filteredPrayerTimes, newPrayerTimes);
			const sortedPrayerTimes = this.sortPrayerTimesByDate(mergedPrayerTimes);
			mergedAndSortedPrayerTimes.push(...sortedPrayerTimes);
		}

		return mergedAndSortedPrayerTimes;
	}

	private filterPrayerTimesByDateRange(prayerTimes: AladhanPrayerTime[], numberOfDays: number): AladhanPrayerTime[] {
		const filteredPrayerTimes = prayerTimes.filter((prayerTime) => {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const maxDate = new Date(today);
			maxDate.setDate(today.getDate() + numberOfDays);
			const prayerTimeDate = new Date(prayerTime.date.gregorian.date);
			const isInRange = prayerTimeDate >= today && prayerTimeDate <= maxDate;
			return isInRange;
		});
		return filteredPrayerTimes;
	}

	private mergeAndReplacePrayerTimes(existingPrayerTimes: AladhanPrayerTime[], newPrayerTimes: AladhanPrayerTime[]): AladhanPrayerTime[] {
		const mergedAndReplacedPrayerTimes: AladhanPrayerTime[] = [...existingPrayerTimes];

		newPrayerTimes.forEach((newPrayerTime: AladhanPrayerTime) => {
			const alreadyExists = mergedAndReplacedPrayerTimes.some(
				(existingPrayerTime) => JSON.stringify(existingPrayerTime) === JSON.stringify(newPrayerTime),
			);

			if (!alreadyExists) {
				const indexToReplace = mergedAndReplacedPrayerTimes.findIndex(
					({
						date: {
							gregorian: { date },
						},
					}) => newPrayerTime.date.gregorian.date === date,
				);

				if (indexToReplace >= 0) {
					mergedAndReplacedPrayerTimes[indexToReplace] = newPrayerTime;
				} else {
					mergedAndReplacedPrayerTimes.push(newPrayerTime);
				}
			}
		});

		return mergedAndReplacedPrayerTimes;
	}

	private sortPrayerTimesByDate(prayerTimes: AladhanPrayerTime[]): AladhanPrayerTime[] {
		const sortedPrayerTimes = [...prayerTimes];
		return sortedPrayerTimes.sort((a, b) => {
			const dateA = new Date(a.date.gregorian.date).getTime();
			const dateB = new Date(b.date.gregorian.date).getTime();
			return dateA - dateB;
		});
	}

	private removeDuplicates(prayerTimes: AladhanPrayerTime[]): AladhanPrayerTime[] {
		const uniquePrayerTimes: AladhanPrayerTime[] = [];
		prayerTimes.forEach((prayerTime) => {
			if (!uniquePrayerTimes.some((uniqueTime) => JSON.stringify(uniqueTime) === JSON.stringify(prayerTime))) {
				uniquePrayerTimes.push(prayerTime);
			}
		});
		return uniquePrayerTimes;
	}
}
