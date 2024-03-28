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

	async getPrayerTime(date: Date = new Date()): Promise<AladhanPrayerTime> {
		try {
			const dateString = dateToString(date);
			const baseUrl = `${this.baseUrl}/${dateString}`;

			const response = await fetchRequest(
				baseUrl,
				this.parameters,
				{},
				async (request) => await request.loadJSON(),
				(response) => {
					throw new Error(response.data);
				},
			);

			const data: AladhanPrayerTime = response.data;
			return data;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			throw new Error(`Failed to retrieve prayer times: ${errorMessage}`);
		}
	}

	/**
	 * Retrieves the prayer times for a given start date and offset.
	 * @param {Date} startDate - The start date for retrieving prayer times. Defaults to the current date.
	 * @param {number} numberOfDays - The number of days to retrieve prayer times for.
	 * @returns {Promise<AladhanPrayerTime[]>} A promise that resolves to an array of AladhanPrayerTime objects.
	 * @example
	 * const aladhanTimings = new AladhanTimings();
	 * const startDate = new Date('2022-01-01');
	 * const offset = 7;
	 * const prayerTimes = await aladhanTimings.getPrayerTimes(startDate, offset);
	 * console.log(prayerTimes);
	 */
	public async getPrayerTimes(startDate: Date, numberOfDays: number): Promise<AladhanPrayerTime[]> {
		const prayerTimes: AladhanPrayerTime[] = [];
		const date = new Date(startDate);

		for (let day = 0; day < numberOfDays; day++) {
			date.setDate(date.getDate() + day);

			const aladhanPrayerTimeData = await this.getPrayerTime(date);
			prayerTimes.push(aladhanPrayerTimeData);
		}

		return Promise.all(prayerTimes);
	}

	public mergePrayerTimes(
		newPrayerTimes: AladhanPrayerTime[],
		existingPrayerTimes: AladhanPrayerTime[] | undefined,
		offlineDays: number,
	): AladhanPrayerTime[] {
		const mergedAndSortedPrayerTimes: AladhanPrayerTime[] = [];

		if (existingPrayerTimes) {
			const mergedPrayerTimes = this.mergeAndReplacePrayerTimes(existingPrayerTimes, newPrayerTimes);
			const sortedPrayerTimes = this.sortPrayerTimesByDate(mergedPrayerTimes);
			const deduplicatedPrayerTimes = this.removeDuplicates(sortedPrayerTimes);
			const filteredPrayerTimes = this.filterPrayerTimesByDateRange(deduplicatedPrayerTimes, offlineDays);
			mergedAndSortedPrayerTimes.push(...filteredPrayerTimes);
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
