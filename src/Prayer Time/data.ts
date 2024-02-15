import { loadData, saveData } from "Prayer Time/generics/fileManager";
import { getData } from "Prayer Time/generics/getData";
import { APIData, PrayerTime, Preferences, RelativeDateTimeState, Timing } from "Prayer Time/types";
import { stringToDate, getUrl } from "Prayer Time/utilities";

export function convertTimingsToDateArray(day: APIData): Timing[] {
	const {
		timings,
		date: { gregorian },
	} = day;
	const baseDateStr = gregorian.date; // "DD-MM-YYYY"
	const baseDateComponents = baseDateStr.split("-"); // Split into [DD, MM, YYYY]
	const dateFormatted = `${baseDateComponents[2]}-${baseDateComponents[1]}-${baseDateComponents[0]}`; // YYYY-MM-DD

	return Object.entries(timings).map(([prayerName, prayerTime]) => {
		const timeComponents = prayerTime.split(":"); // Split into [HH, MM]
		const dateTime = new Date(`${dateFormatted}T${timeComponents[0]}:${timeComponents[1]}:00`);
		return { prayer: prayerName, time: dateTime };
	});
}

export function getDay(data: APIData[], dayDate?: Date) {
	const dayArray: APIData[] = data.filter(
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
		const today: APIData = dayArray[0];
		return today;
	}
}

export function removeDuplicateData(array: APIData[]): APIData[] {
	const newArray: APIData[] = [];
	array.forEach((object) => {
		if (!newArray.some((o) => JSON.stringify(o) === JSON.stringify(object))) {
			newArray.push(object);
		}
	});
	return newArray;
}

export async function getNewData(preferences: Preferences) {
	const {
		api: {
			endpoint,
			method,
			location: { latitude, longitude },
		},
		widget: {
			settings: { offline: offlineDays },
		},
	} = preferences;

	const newData: APIData[] = [];

	for (let day = 0; day < offlineDays; day++) {
		const date = new Date();
		date.setDate(date.getDate() + day);

		const url = getUrl(endpoint, date, {
			latitude: latitude,
			longitude: longitude,
			method: method,
		});

		const response = await getData(url);
		const data = response.data;
		newData.push(data);
	}

	return newData;
}

export async function saveNewData(path: string, offlineDays: number, data: APIData[]) {
	const newData: APIData[] = data;
	const offlineData: APIData[] = await loadData(path);
	const mergedData: APIData[] = [];

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
	newData.forEach((day: APIData) => {
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

export function getPrayerTimes(dayData: APIData[], userPrayerTimes: PrayerTime[], itemsToShow: number) {
	const now = new Date();

	const displayKeys = userPrayerTimes.map((prayerTime) => {
		return prayerTime.name.toUpperCase();
	});

	const sortedTimes = dayData
		.map((day) => convertTimingsToDateArray(day))
		.flat()
		.filter((prayerTime) => displayKeys.includes(prayerTime.prayer.toUpperCase()))
		.filter((prayerTime) => prayerTime.time > now)
		.sort((dateA, dateB) => dateA.time.getTime() - dateB.time.getTime())
		.slice(0, itemsToShow);

	return sortedTimes;
}

export function addStatusToPrayerTimes(prayerTimings: Timing[]) {
	const now = new Date();
	const todayStart = new Date(new Date(now).setHours(0, 0, 0, 0));
	const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

	const nextPrayerIndex = prayerTimings.findIndex((prayerTime) => prayerTime.time > now);

	return prayerTimings.map((prayerTime, index) => {
		let state: RelativeDateTimeState = "unknown";
		let next = false;

		if (prayerTime.time < now) {
			state = "past";
		} else if (prayerTime.time > now && prayerTime.time <= todayEnd) {
			state = "today";
		} else {
			state = "future";
		}

		if (index === nextPrayerIndex) {
			next = true;
		}

		return {
			prayer: prayerTime.prayer,
			time: prayerTime.time,
			status: { state, next },
		};
	});
}
