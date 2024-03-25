import type { WidgetPreferences } from "src/Prayer Time/types";
import type { DeepPartial } from "src/types/helpers";
import type { WidgetSize } from "src/types/scriptable";
import { getSettings } from "src/utilities/getSettings";
import { getWidgetSize } from "src/utilities/scriptable/getWidgetSize";

export class PrayerTimeBase {
	protected online: boolean;
	protected widgetSize: WidgetSize;
	protected displayItems: number;
	protected preferences: WidgetPreferences;
	protected offlineDataDistanceMetres: number;

	constructor(userPreferences: DeepPartial<WidgetPreferences>) {
		this.online = false;
		this.widgetSize = getWidgetSize("large");
		this.displayItems = this.getDisplayItems(this.widgetSize);
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
		this.offlineDataDistanceMetres = this.preferences.user.distanceToleranceMetres;
	}

	private getDisplayItems(widgetSize: WidgetSize): number {
		switch (widgetSize) {
			case "small":
			case "medium":
				return 5;
			case "large":
			case "extraLarge":
				return 13;
			case "accessoryCircular":
			case "accessoryInline":
			case "accessoryRectangular":
				return 1;
			default:
				return 5;
		}
	}

	protected parseDateString(dateString: string): Date {
		const [day, month, year] = dateString.split("-");
		const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
		parsedDate.setHours(0, 0, 0, 0);
		return parsedDate;
	}

	protected calculateDistance(
		startLocation: { latitude: number; longitude: number },
		endLocation: { latitude: number; longitude: number },
	): number {
		const calculateHaversine = (
			startLocation: { latitude: number; longitude: number },
			endLocation: { latitude: number; longitude: number },
		): number => {
			const EARTH_RADIUS_KM = 6371;
			const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180);

			const deltaLatitude = degreesToRadians(endLocation.latitude - startLocation.latitude);
			const deltaLongitude = degreesToRadians(endLocation.longitude - startLocation.longitude);

			const a =
				Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
				Math.cos(degreesToRadians(startLocation.latitude)) *
					Math.cos(degreesToRadians(endLocation.latitude)) *
					Math.sin(deltaLongitude / 2) *
					Math.sin(deltaLongitude / 2);

			const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

			const distanceInKm = EARTH_RADIUS_KM * c;
			return distanceInKm;
		};

		const distanceInM = calculateHaversine(startLocation, endLocation) * 1000;
		return distanceInM;
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

	protected calculateDaysDifference(startDate: Date, endDate: Date): number {
		const _startDate = new Date(startDate);
		const _endDate = new Date(endDate);
		const differenceInTime = _endDate.getTime() - _startDate.getTime();
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
