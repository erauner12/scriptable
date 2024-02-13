import { loadData } from "Prayer Time/generics/fileManager";
import { calculateDistance, getFilePath, getLocation, isOnline } from "Prayer Time/utilities";
import { APIData, PrayerTime, Preferences } from "Prayer Time/types";
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
				{ name: "fajr", display: "🌄" },
				{ name: "sunrise", display: "🌅" },
				{ name: "dhuhr", display: "🏞" },
				{ name: "asr", display: "🏙" },
				{ name: "maghrib", display: "🌇" },
				{ name: "isha", display: "🌃" },
				{ name: "sunset", display: "🌅" },
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
			display: { prayerTimes },
		},
		api: { location },
	} = PREFERENCES;
	const DISTANCE_TOLERANCE_METRES = 1000; // 1KM
	const filePath = getFilePath(fileName, directoryName);

	const deviceOnline = await isOnline();

	if (deviceOnline) {
		const { latitude: deviceLatitude, longitude: deviceLongitude } = await getLocation(PREFERENCES);

		PREFERENCES.api.location.latitude = deviceLatitude;
		PREFERENCES.api.location.longitude = deviceLongitude;

		const today = new Date();
		const offlineData: APIData[] = await loadData(filePath);
		const todayData = getDay(offlineData, today);

		let distanceSinceOfflineData: number = 0;

		if (todayData) {
			const {
				meta: { latitude, longitude },
			} = todayData;

			const distance = calculateDistance(location, {
				latitude,
				longitude,
			});

			distanceSinceOfflineData = Math.round(distance);
		}

		if (location && (!todayData || distanceSinceOfflineData > DISTANCE_TOLERANCE_METRES)) {
			const updatedData = await getNewData(PREFERENCES);
			await saveNewData(filePath, offlineDays, updatedData);
		}
	}

	const dayData = await loadData(filePath);

	if (dayData) {
		presentData(dayData, prayerTimes);
	}
}

function presentData(dayData: APIData[], prayerTimes: PrayerTime[]) {
	const itemsToShow = 2;
	const currentDateTime = new Date();

	const displayKeys = prayerTimes.map((prayerTime) => {
		return prayerTime.name.toUpperCase();
	});

	const timings = dayData
		.map((day) => convertTimingsToDateArray(day))
		.flat()
		.filter((prayerTime) => displayKeys.includes(prayerTime.prayer.toUpperCase()))
		.filter((prayerTime) => prayerTime.time > currentDateTime)
		.sort((dateA, dateB) => dateA.time.getTime() - dateB.time.getTime())
		.slice(0, itemsToShow);

	createWidget(timings, prayerTimes);
}
