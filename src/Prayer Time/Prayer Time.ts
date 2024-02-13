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
				{ name: "fajr", display: "🌄", abbreviation: "FR" },
				{ name: "sunrise", display: "🌅", abbreviation: "SR" },
				{ name: "dhuhr", display: "🏞", abbreviation: "DR" },
				{ name: "asr", display: "🏙", abbreviation: "AR" },
				{ name: "maghrib", display: "🌇", abbreviation: "MB" },
				{ name: "isha", display: "🌃", abbreviation: "IA" },
				{ name: "sunset", display: "🌅", abbreviation: "SS" },
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
		presentData(dayData, userPrayerTimes, ITEMS_TO_SHOW);
	}
}

function presentData(dayData: APIData[], userPrayerTimes: PrayerTime[], itemsToShow: number) {
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
		let status: RelativeDateTimeState;

		if (prayerTime.time < now) {
			status = "past";
		} else if (prayerTime.time > now && prayerTime.time <= todayEnd) {
			status = "today";
		} else {
			status = "future";
		}

		if (index === nextPrayerIndex) {
			status = "next"; // The closest future prayer
		}

		console.log([prayerTime.time, status, now, todayEnd]);

		return {
			prayer: prayerTime.prayer,
			time: prayerTime.time,
			status: status,
		};
	});

	createWidget(timings, userPrayerTimes);
}
