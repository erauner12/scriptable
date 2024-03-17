import { loadData, saveData } from "src/Prayer Time/generics/fileManager";
import {
	type PrayerTime,
	type UserPrayerTime,
	type RelativeDateTimeState,
	type Timing,
} from "src/Prayer Time/types";
import { stringToDate, getUrl } from "src/Prayer Time/utilities";
import { fetchRequest } from "src/utilities/fetch";

export function convertTimingsToDateArray(day: PrayerTime): Timing[] {
	const {
		timings,
		date: { gregorian },
	} = day;
	const baseDateStr = gregorian.date; // "DD-MM-YYYY"
	const baseDateComponents = baseDateStr.split("-"); // Split into [DD, MM, YYYY]
	const dateFormatted = `${baseDateComponents[2]}-${baseDateComponents[1]}-${baseDateComponents[0]}`; // YYYY-MM-DD

	return Object.entries(timings).map(([prayerName, prayerTime]) => {
		const timeComponents = prayerTime.split(":"); // Split into [HH, MM]
		const dateTime = new Date(
			`${dateFormatted}T${timeComponents[0]}:${timeComponents[1]}:00`
		);
		return { prayer: prayerName, dateTime: dateTime };
	});
}

export function getDay(data: PrayerTime[], dayDate?: Date) {
	const dayArray: PrayerTime[] = data.filter(
		({
			date: {
				gregorian: { date },
			},
		}) => {
			const day = dayDate ? dayDate : new Date();
			day.setHours(0, 0, 0, 0);
			const parsedDate = stringToDate(date);
			const isDay = day.toDateString() === parsedDate.toDateString();
			return isDay;
		}
	);

	if (dayArray[0]) {
		const today: PrayerTime = dayArray[0];
		return today;
	}
}

export function removeDuplicateData(array: PrayerTime[]): PrayerTime[] {
	const newArray: PrayerTime[] = [];
	array.forEach((object) => {
		if (!newArray.some((o) => JSON.stringify(o) === JSON.stringify(object))) {
			newArray.push(object);
		}
	});
	return newArray;
}

export async function getNewData(
	endpoint: string,
	method: number | undefined,
	location: Location.CurrentLocation,
	numberOfDays: number
): Promise<PrayerTime[]> {
	try {
		const { latitude, longitude } = location;
		const newData: PrayerTime[] = [];

		for (let day = 0; day < numberOfDays; day++) {
			const date = new Date();
			date.setDate(date.getDate() + day);

			const url = getUrl(endpoint, date, {
				latitude: latitude,
				longitude: longitude,
				method: method,
			});

			const request = await fetchRequest(url);
			const response = await request.loadJSON();
			const data = response.data;
			newData.push(data);
		}

		return newData;
	} catch (error) {
		if (typeof error === "string") throw Error(error);
		throw new Error("An unknown error occurred.");
	}
}

export async function saveNewData(
	path: string,
	offlineDays: number,
	data: PrayerTime[]
) {
	const newData: PrayerTime[] = data;
	const offlineData: PrayerTime[] = await loadData(path);
	const mergedData: PrayerTime[] = [];

	removeDuplicateData(offlineData).filter(
		({
			date: {
				gregorian: { date },
			},
		}) => {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const max = new Date(today);
			max.setDate(today.getDate() + offlineDays);
			const isGreaterOrEqualToToday = stringToDate(date) >= today;
			const isLessOrEqualToMax = stringToDate(date) <= max;
			const isInRange = isGreaterOrEqualToToday && isLessOrEqualToMax;
			return isInRange;
		}
	);

	// Update merged `day` values if already exist, else add new `days`
	newData.forEach((day: PrayerTime) => {
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
				}
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

	saveData(path, mergedData);
}

export function getPrayerTimes(
	dayData: PrayerTime[],
	userPrayerTimes: UserPrayerTime[],
	itemsToShow?: number
) {
	const now = new Date();

	const displayKeys = userPrayerTimes.map((prayerTime) => {
		return prayerTime.name.toUpperCase();
	});

	let sortedTimes = dayData
		.map((day) => convertTimingsToDateArray(day))
		.flat()
		.filter((prayerTime) =>
			displayKeys.includes(prayerTime.prayer.toUpperCase())
		)
		.filter((prayerTime) => prayerTime.dateTime > now)
		.sort(
			(dateA, dateB) => dateA.dateTime.getTime() - dateB.dateTime.getTime()
		);

	if (itemsToShow) sortedTimes = sortedTimes.slice(0, itemsToShow);

	return sortedTimes;
}

export function addStatusToPrayerTimes(prayerTimings: Timing[]): Timing[] {
	const now = new Date();
	const todayStart = new Date(new Date(now).setHours(0, 0, 0, 0));
	const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

	const nextPrayerIndex = prayerTimings.findIndex(
		(prayerTime) => prayerTime.dateTime > now
	);

	return prayerTimings.map((prayerTime, index) => {
		let state: RelativeDateTimeState = "unknown";
		let next = false;

		if (prayerTime.dateTime < now) {
			state = "past";
		} else if (prayerTime.dateTime > now && prayerTime.dateTime <= todayEnd) {
			state = "today";
		} else {
			state = "future";
		}

		if (index === nextPrayerIndex) {
			next = true;
		}

		return {
			prayer: prayerTime.prayer,
			dateTime: prayerTime.dateTime,
			status: { state, next },
		};
	});
}
