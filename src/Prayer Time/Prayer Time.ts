import { loadData } from "src/Prayer Time/generics/fileManager";
import {
	calculateDistance,
	getFilePath,
	isOnline,
} from "src/Prayer Time/utilities";
import { type PrayerTime, type WidgetPreferences } from "src/Prayer Time/types";
import {
	getDay,
	getNewData,
	saveNewData,
	getPrayerTimes,
} from "src/Prayer Time/data";
import { createWidget } from "src/Prayer Time/widget";
import { type WidgetSize } from "src/types/scriptable";

const DEFAULT_PREFERENCES: WidgetPreferences = {
	user: {
		settings: {
			file: "Prayer Time",
			directory: "Prayer Time",
			offline: 5,
			distance: 1000,
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
			settings: {
				directory: directoryName,
				file: fileName,
				offline: offlineDays,
				distance: distanceToleranceMetres,
			},
			display: { prayerTimes: userPrayerTimes },
		},
	} = DEFAULT_PREFERENCES;

	const WIDGET_SIZE: WidgetSize = config.widgetFamily
		? config.widgetFamily
		: "small";
	const displayItems = getDisplayItems(WIDGET_SIZE);
	const filePath = getFilePath(fileName, directoryName);
	const deviceOnline = await isOnline();

	let offlineDataDistanceMetres: number = 0;

	if (deviceOnline) {
		const today = new Date();
		const offlineData: PrayerTime[] = await loadData(filePath);
		const todayData = getDay(offlineData, today);
		const numberOfPrayerTimes = getPrayerTimes(
			offlineData,
			userPrayerTimes
		).length;

		const currentLocation = await Location.current();

		// TODO Add location to stored data

		if (todayData) {
			const { meta } = todayData;
			const distance = calculateDistance(currentLocation, meta);
			offlineDataDistanceMetres =
				Math.round((distance + Number.EPSILON) * 100) / 100;
		}

		if (
			numberOfPrayerTimes <= displayItems ||
			offlineDataDistanceMetres > distanceToleranceMetres
		) {
			const { data } = DEFAULT_PREFERENCES;
			if (!data) throw new Error("No stored data found.");
			if (!data.api) throw new Error("No API data found.");
			const { endpoint, method } = data.api;

			const updatedData = await getNewData(
				endpoint,
				method,
				currentLocation,
				offlineDays
			);
			await saveNewData(filePath, offlineDays, updatedData);
		}
	}

	const dayData = await loadData(filePath);

	if (dayData) {
		const widget = createWidget(
			dayData,
			userPrayerTimes,
			displayItems,
			WIDGET_SIZE,
			offlineDataDistanceMetres
		);
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

function getDisplayItems(widgetSize: WidgetSize) {
	switch (widgetSize) {
		case "small":
		case "medium":
			return 5;
		case "large":
		case "extraLarge":
			return 14;
		case "accessoryCircular":
		case "accessoryInline":
		case "accessoryRectangular":
			return 1;
		default:
			return 5;
	}
}
