import { loadData } from "src/Prayer Time/generics/fileManager";
import {
	calculateDistance,
	getFilePath,
	isOnline,
	roundToTwoDecimals,
} from "src/Prayer Time/utilities";
import {
	type AladhanPrayerTime,
	type WidgetPreferences,
} from "src/Prayer Time/types";
import {
	getDay,
	getNewData,
	saveNewData,
	getPrayerTimes,
} from "src/Prayer Time/data";
import { createWidget } from "src/Prayer Time/widget";
import { type WidgetSize } from "src/types/scriptable";
import { getWidgetSize } from "src/utilities/scriptable/getWidgetSize";
import { getSettings } from "src/utilities/getSettings";

const defaultPreferences: WidgetPreferences = {
	user: {
		offlineDays: 5,
		distanceToleranceMetres: 1000,
		displayPrayerTimes: [
			{ name: "fajr", display: "🌄", abbreviation: "FAJ" }, // Dawn
			{ name: "sunrise", display: "🌅", abbreviation: "SUR" }, // Sunrise
			{ name: "dhuhr", display: "🕛", abbreviation: "DHU" }, // Midday
			{ name: "asr", display: "🌞", abbreviation: "ASR" }, // Afternoon
			{ name: "sunset", display: "🌇", abbreviation: "SUS" }, // Sunset
			{ name: "maghrib", display: "🌆", abbreviation: "MAG" }, // Dusk
			{ name: "isha", display: "🌙", abbreviation: "ISH" }, // Night
			{ name: "imsak", display: "⭐", abbreviation: "IMS" }, // Pre-dawn
			{ name: "midnight", display: "🕛", abbreviation: "MID" }, // Midnight
			{ name: "firstthird", display: "🌌", abbreviation: "FTH" }, // Late Night
			{ name: "lastthird", display: "🌒", abbreviation: "LTH" }, // Pre-fajr
		],
		aladhan: {
			method: 15,
		},
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
	const settings = getSettings<WidgetPreferences>(
		defaultPreferences,
		{},
		{
			user: {
				displayPrayerTimes: [
					{ name: "fajr", display: "🌄", abbreviation: "FAJ" }, // Dawn
					{ name: "dhuhr", display: "🕛", abbreviation: "DHU" }, // Midday
					{ name: "asr", display: "🌞", abbreviation: "ASR" }, // Afternoon
					{ name: "maghrib", display: "🌆", abbreviation: "MAG" }, // Dusk
					{ name: "isha", display: "🌙", abbreviation: "ISH" }, // Night
					{ name: "imsak", display: "⭐", abbreviation: "IMS" }, // Pre-dawn
				],
			},
		}
	);

	const widgetSize = getWidgetSize("medium");
	const displayItems = getDisplayItems(widgetSize);
	const filePath = getFilePath(Script.name(), Script.name());
	const deviceOnline = await isOnline();

	let offlineDataDistanceMetres: number = 0;

	if (deviceOnline) {
		const today = new Date();
		const offlineData: AladhanPrayerTime[] = await loadData(filePath);
		const todayData = getDay(offlineData, today);
		const numberOfPrayerTimes = getPrayerTimes(
			offlineData,
			settings.user.displayPrayerTimes
		).length;

		const currentLocation = await Location.current();

		// TODO Add location to stored data

		if (todayData) {
			const { meta } = todayData;
			const distance = calculateDistance(currentLocation, meta);
			offlineDataDistanceMetres = roundToTwoDecimals(distance);
		}

		if (
			numberOfPrayerTimes <= displayItems ||
			offlineDataDistanceMetres > settings.user.distanceToleranceMetres
		) {
			const { data } = settings;
			if (!data) throw new Error("No stored data found.");

			const updatedData = await getNewData(
				"https://api.aladhan.com/v1/timings/",
				settings.user.aladhan.method,
				currentLocation,
				settings.user.offlineDays
			);
			await saveNewData(filePath, settings.user.offlineDays, updatedData);
		}
	}

	const dayData = await loadData(filePath);

	if (dayData) {
		const widget = createWidget(
			dayData,
			settings.user.displayPrayerTimes,
			displayItems,
			widgetSize,
			offlineDataDistanceMetres
		);
		if (config.runsInAccessoryWidget) {
			widget.addAccessoryWidgetBackground = true;
			Script.setWidget(widget);
			Script.complete();
		} else {
			await widget.presentMedium();
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
