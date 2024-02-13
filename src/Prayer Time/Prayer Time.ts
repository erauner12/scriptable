import { loadData } from "Prayer Time/generics/fileManager";
import { calculateDistance, getFilePath, getLocation, isOnline } from "Prayer Time/utilities";
import { APIData, PrayerTime, Preferences, RelativeDateTimeState } from "Prayer Time/types";
import { getDay, getNewData, saveNewData, convertTimingsToDateArray } from "Prayer Time/data";
import { createWidget } from "Prayer Time/widget";

const PREFERENCES: Preferences = {
	widget: {
		settings: {
			file: "Prayer Time",
			directory: "Prayer Time",
			size: "small",
			offline: 3,
		},
		display: {
			prayerTimes: [
				{ name: "fajr", display: "🌄", abbreviation: "FAJ" }, // Dawn
				// { name: "sunrise", display: "🌅", abbreviation: "SUR" }, // Sunrise
				{ name: "dhuhr", display: "🕛", abbreviation: "DHU" }, // Midday
				{ name: "asr", display: "🌞", abbreviation: "ASR" }, // Afternoon
				// { name: "sunset", display: "🌇", abbreviation: "SUS" }, // Sunset
				{ name: "maghrib", display: "🌆", abbreviation: "MAG" }, // Dusk
				{ name: "isha", display: "🌙", abbreviation: "ISH" }, // Night
				{ name: "imsak", display: "⭐", abbreviation: "IMS" }, // Pre-dawn
				// { name: "midnight", display: "🕛", abbreviation: "MID" }, // Midnight
				// { name: "firstthird", display: "🌌", abbreviation: "FTH" }, // Late Night
				// { name: "lastthird", display: "🌒", abbreviation: "LTH" }, // Pre-fajr
			],
		},
	},
	api: {
		endpoint: "https://api.aladhan.com/v1/timings/",
		location: {
			latitude: 0,
			longitude: 0,
		},
	},
};

(async () => {
	try {
		await runScript();
	} catch (error) {
		console.error(error);
	}
})();

async function runScript() {
	const {
		widget: {
			settings: { directory: directoryName, file: fileName, offline: offlineDays },
			display: { prayerTimes: userPrayerTimes },
		},
		api: { location },
	} = PREFERENCES;
	const DISTANCE_TOLERANCE_METRES = 1000; // 1KM
	const ITEMS_TO_SHOW = 5;
	const filePath = getFilePath(fileName, directoryName);

	const deviceOnline = await isOnline();

	let offlineDataDistanceMetres: number = 0;

	if (deviceOnline) {
		const { latitude: deviceLatitude, longitude: deviceLongitude } = await getLocation(PREFERENCES);

		PREFERENCES.api.location.latitude = deviceLatitude;
		PREFERENCES.api.location.longitude = deviceLongitude;

		const today = new Date();
		const offlineData: APIData[] = await loadData(filePath);
		const todayData = getDay(offlineData, today);

		if (todayData) {
			const {
				meta: { latitude, longitude },
			} = todayData;

			const distance = calculateDistance(location, {
				latitude,
				longitude,
			});

			offlineDataDistanceMetres = Math.round((distance + Number.EPSILON) * 100) / 100;
		}

		if (location && (!todayData || offlineDataDistanceMetres > DISTANCE_TOLERANCE_METRES)) {
			const updatedData = await getNewData(PREFERENCES);
			await saveNewData(filePath, offlineDays, updatedData);
		}
	}

	const dayData = await loadData(filePath);

	if (dayData) {
		presentData(dayData, userPrayerTimes, offlineDataDistanceMetres, ITEMS_TO_SHOW);
	}
}

function presentData(dayData: APIData[], userPrayerTimes: PrayerTime[], distance: number, itemsToShow: number) {
	const now = new Date();
	const todayStart = new Date(new Date(now).setHours(0, 0, 0, 0));
	const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

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

	const nextPrayerIndex = sortedTimes.findIndex((prayerTime) => prayerTime.time > now);

	const timings = sortedTimes.map((prayerTime, index) => {
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

	createWidget(timings, userPrayerTimes, distance);
}
