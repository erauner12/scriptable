import type { WidgetPreferences } from "src/Prayer Time/types";
import type { DeepPartial } from "src/types/helpers";
import type { WidgetSize } from "src/types/scriptable";
import { getSettings } from "src/utilities/getSettings";
import { getWidgetSize } from "src/utilities/scriptable/getWidgetSize";

export class PrayerTimeBase {
	protected online: boolean;
	protected widgetSize: WidgetSize;
	protected displayItems: number;
	protected offlineDataDistanceMetres: number;
	protected preferences: WidgetPreferences;

	constructor(userPreferences: DeepPartial<WidgetPreferences>) {
		this.online = false;
		this.widgetSize = getWidgetSize("medium");
		this.displayItems = this.getDisplayItems(this.widgetSize);
		this.offlineDataDistanceMetres = 0;
		this.preferences = getSettings<WidgetPreferences>(
			{
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
				data: { location: undefined, prayerTimes: undefined },
			},
			userPreferences,
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
				data: {},
			},
		);
	}

	private getDisplayItems(widgetSize: WidgetSize): number {
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

	protected stringToDate(dateString: string): Date {
		const [day, month, year] = dateString.split("-");
		const date = new Date(Number(year), Number(month) - 1, Number(day));
		date.setHours(0, 0, 0, 0);
		return date;
	}

	protected calculateDistance(point1: { latitude: number; longitude: number }, point2: { latitude: number; longitude: number }): number {
		const R = 6371; // Radius of the Earth in km
		const radians = (degrees: number) => degrees * (Math.PI / 180); // Convert degrees to radians

		// Difference in coordinates
		const deltaLat = radians(point2.latitude - point1.latitude);
		const deltaLon = radians(point2.longitude - point1.longitude);

		// Apply Haversine formula
		const a =
			Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
			Math.cos(radians(point1.latitude)) * Math.cos(radians(point2.latitude)) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		const distance = R * c; // Distance in km
		return distance * 1000; // Distance in metres
	}

	protected roundToTwoDecimals(number: number): number {
		return Math.round((number + Number.EPSILON) * 100) / 100;
	}

	protected convertToLocaleAmPm(
		date: Date,
		options: Intl.DateTimeFormatOptions | undefined = {
			hour: "numeric",
			minute: "numeric",
			hour12: true,
		},
	): string {
		const localAmPmTime = date.toLocaleTimeString(undefined, options).toUpperCase();
		return localAmPmTime;
	}

	protected getDaysBetweenDates(date1: Date, date2: Date): number {
		const _date1 = new Date(date1);
		const _date2 = new Date(date2);
		const differenceInTime = _date2.getTime() - _date1.getTime();
		const differenceInDays = differenceInTime / (1000 * 60 * 60 * 24);
		return Math.abs(differenceInDays);
	}

	// private capitaliseWord(word: string) {
	// 	const firstLetter = word.charAt(0).toUpperCase();
	// 	const rest = word.slice(1).toLowerCase();
	// 	const capitalisedWord = firstLetter + rest;
	// 	return capitalisedWord.trim();
	// }

	// // Overwrite the default values when running as widget
	// private getWidgetArguments(userPreferences: Record<string, any>, argumentNames: string[]) {
	// 	argumentNames.forEach((argumentName) => {
	// 		if (userPreferences[argumentName] && args.widgetParameter.includes(argumentName)) {
	// 			userPreferences[argumentName] = args.widgetParameter[argumentName];
	// 		}
	// 	});
	// }
}
