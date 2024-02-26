import { loadData } from "Prayer Time/generics/fileManager";
import { calculateDistance, getFilePath, isOnline } from "Prayer Time/utilities";
import { PrayerTime, WidgetPreferences } from "Prayer Time/types";
import { getDay, getNewData, saveNewData, getPrayerTimes } from "Prayer Time/data";
import { createWidget } from "Prayer Time/widget";
import { WidgetSize } from "../../modules/scriptableTypes";

const DEFAULT_PREFERENCES: WidgetPreferences = {
	user: {
		settings: {
			file: "Prayer Time",
			directory: "Prayer Time",
			offline: 5,
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
	data: {
		api: {
			endpoint: "https://api.aladhan.com/v1/timings/",
		},
	},
	developer: {
		previewWidgetSize: "small",
	},
};

(async () => {
	try {
		await runScript();
		Script.complete();
	} catch (error) {
		console.error(error);
	}
})();

async function runScript() {
	const {
		user: {
			settings: { directory: directoryName, file: fileName, offline: offlineDays },
			display: { prayerTimes: userPrayerTimes },
		},
	} = DEFAULT_PREFERENCES;

	const DISTANCE_TOLERANCE_METRES = 1000; // 1KM
	const WIDGET_SIZE: WidgetSize = config.widgetFamily ? config.widgetFamily : "small";
	let ITEMS_TO_SHOW = 5;

	switch (WIDGET_SIZE) {
		case "small":
		case "medium":
			ITEMS_TO_SHOW = 5;
			break;
		case "large":
		case "extraLarge":
			ITEMS_TO_SHOW = 14;
			break;
		case "accessoryCircular":
		case "accessoryInline":
		case "accessoryRectangular":
			ITEMS_TO_SHOW = 1;
			break;
		default:
			ITEMS_TO_SHOW = 5;
			break;
	}

	const filePath = getFilePath(fileName, directoryName);
	const deviceOnline = await isOnline();

	let offlineDataDistanceMetres: number = 0;

	if (deviceOnline) {
		const today = new Date();
		const offlineData: PrayerTime[] = await loadData(filePath);
		const todayData = getDay(offlineData, today);
		const numberOfPrayerTimes = getPrayerTimes(offlineData, userPrayerTimes).length;

		const currentLocation = await Location.current();

		// TODO Add location to stored data

		const hasCurrentLocation = currentLocation.latitude !== undefined && currentLocation.longitude !== undefined;

		if (hasCurrentLocation && todayData) {
			const { meta } = todayData;
			const distance = calculateDistance(currentLocation, meta);
			offlineDataDistanceMetres = Math.round((distance + Number.EPSILON) * 100) / 100;
		}

		if (
			hasCurrentLocation &&
			(numberOfPrayerTimes <= ITEMS_TO_SHOW || offlineDataDistanceMetres > DISTANCE_TOLERANCE_METRES)
		) {
			const updatedData = await getNewData({ ...DEFAULT_PREFERENCES, data: { location: currentLocation } });
			if (!updatedData) throw Error("No updated data was available!");
			await saveNewData(filePath, offlineDays, updatedData);
		}
	}

	const dayData = await loadData(filePath);

	if (dayData) {
		const widget = createWidget(dayData, userPrayerTimes, ITEMS_TO_SHOW, WIDGET_SIZE, offlineDataDistanceMetres);
		if (config.runsInAccessoryWidget) {
			widget.addAccessoryWidgetBackground = true;
			Script.setWidget(widget);
			Script.complete();
		} else {
			await widget.presentLarge();
			Script.complete();
		}
	}
}
