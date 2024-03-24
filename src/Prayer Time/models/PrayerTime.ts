import { AladhanTimings } from "src/Prayer Time/models/AladhanTimings";
import type {
	AladhanPrayerTime,
	WidgetPrayerTiming,
	UserPrayerTime,
	WidgetPreferences,
	RelativeDateTimeState,
} from "src/Prayer Time/types";
import type { AladhanTimingsMethodValues } from "src/Prayer Time/types/AladhanTimings";
import type { DeepPartial } from "src/types/helpers";
import type { WidgetSize } from "src/types/scriptable";
import { getSettings } from "src/utilities/getSettings";
import { getWidgetSize } from "src/utilities/scriptable/getWidgetSize";
import { ScriptableFileManager } from "src/utilities/scriptable/models/ScriptableFileManager";

export class PrayerTime {
	protected fileManager: ScriptableFileManager;
	protected filePath: string;
	protected online: boolean;
	protected widgetSize: WidgetSize;
	protected displayItems: number;
	protected offlineDataDistanceMetres: number;
	protected preferences: WidgetPreferences;

	constructor(userPreferences: DeepPartial<WidgetPreferences>) {
		this.fileManager = new ScriptableFileManager();
		this.filePath = this.fileManager.joinDocumentPaths([Script.name(), Script.name()], ".json");
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

	private getDisplayItems(widgetSize: WidgetSize) {
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

	protected getPrayerTimes(dayData: AladhanPrayerTime[], userPrayerTimes: UserPrayerTime[], itemsToShow?: number) {
		const now = new Date();

		const displayKeys = userPrayerTimes.map((prayerTime) => {
			return prayerTime.name.toUpperCase();
		});

		let sortedTimes = dayData
			.map((day) => this.convertTimingsToDateArray(day))
			.flat()
			.filter((prayerTime) => displayKeys.includes(prayerTime.prayer.toUpperCase()))
			.filter((prayerTime) => prayerTime.dateTime > now)
			.sort((dateA, dateB) => dateA.dateTime.getTime() - dateB.dateTime.getTime());

		if (itemsToShow) sortedTimes = sortedTimes.slice(0, itemsToShow);

		return sortedTimes;
	}

	private convertTimingsToDateArray(day: AladhanPrayerTime): WidgetPrayerTiming[] {
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
			return { prayer: prayerName, dateTime: dateTime };
		});
	}

	protected getDay(prayerTimes: AladhanPrayerTime[], dayDate?: Date): AladhanPrayerTime | undefined {
		if (!prayerTimes) return undefined;

		const dayArray: AladhanPrayerTime[] = prayerTimes.filter(
			({
				date: {
					gregorian: { date },
				},
			}) => {
				const day = dayDate ? dayDate : new Date();
				day.setHours(0, 0, 0, 0);
				const parsedDate = this.stringToDate(date);
				const isDay = day.toDateString() === parsedDate.toDateString();
				return isDay;
			},
		);

		if (dayArray[0]) {
			const today: AladhanPrayerTime = dayArray[0];
			return today;
		}
	}

	private removeDuplicateData(array: AladhanPrayerTime[]): AladhanPrayerTime[] {
		const newArray: AladhanPrayerTime[] = [];
		array.forEach((object) => {
			if (!newArray.some((o) => JSON.stringify(o) === JSON.stringify(object))) {
				newArray.push(object);
			}
		});
		return newArray;
	}

	protected async getAladhanTimings(
		method: AladhanTimingsMethodValues,
		location: Location.CurrentLocation,
		numberOfDays: number,
	): Promise<AladhanPrayerTime[]> {
		try {
			const { latitude, longitude } = location;
			const newData: AladhanPrayerTime[] = [];

			const aladhanTimings = new AladhanTimings({
				latitude,
				longitude,
				method,
			});

			for (let day = 0; day < numberOfDays; day++) {
				const date = new Date();
				date.setDate(date.getDate() + day);

				const aladhanPrayerTimeData = await aladhanTimings.getPrayerTimes(date);
				newData.push(aladhanPrayerTimeData);
			}

			return newData.sort((a, b) => {
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
		} catch (error) {
			if (typeof error === "string") throw Error(error);
			throw new Error("An unknown error occurred.");
		}
	}

	protected async savePreferences(preferences: WidgetPreferences) {
		this.fileManager.saveJSON(this.filePath, preferences);
	}

	private stringToDate(dateString: string) {
		const [day, month, year] = dateString.split("-");
		const date = new Date(Number(year), Number(month) - 1, Number(day));
		date.setHours(0, 0, 0, 0);
		return date;
	}

	protected calculateDistance(point1: { latitude: number; longitude: number }, point2: { latitude: number; longitude: number }) {
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

	protected roundToTwoDecimals(number: number) {
		return Math.round((number + Number.EPSILON) * 100) / 100;
	}

	protected async isOnline() {
		const waitTimeMs = 15;
		const url = "https://www.google.com";
		const request = new Request(url);
		request.method = "HEAD";
		request.timeoutInterval = waitTimeMs / 60;

		try {
			const response = await request.load();
			if (response) return true;
			return false;
		} catch (error) {
			return false;
		}
	}

	protected createWidget(
		dayData: AladhanPrayerTime[],
		userPrayerTimes: UserPrayerTime[],
		itemsToShow: number,
		widgetSize: WidgetSize,
		distance: number,
	) {
		const sortedTimes = this.getPrayerTimes(dayData, userPrayerTimes, itemsToShow);
		const prayerTimings = this.addStatusToPrayerTimes(sortedTimes);

		const now = new Date();

		const textColourHex = "#FFFFFF";
		const textOpacitySubtle = 0.8;

		const listWidgetSpacing = 4;
		const timingsRowSpacing = 4;
		const timingsRowItemSpacing = 4;

		const listWidget = new ListWidget();

		if (widgetSize !== "accessoryCircular") {
			listWidget.setPadding(16, 20, 16, 20);
			listWidget.spacing = listWidgetSpacing;
		}

		const timingsStack = listWidget.addStack();
		timingsStack.layoutVertically();
		timingsStack.centerAlignContent();
		timingsStack.spacing = timingsRowSpacing;

		prayerTimings.forEach((prayerTiming) => {
			const { prayer, dateTime } = prayerTiming;

			const opacityScaling = this.getDaysBetweenDates(now, dateTime) + 1;
			const textOpacity = textOpacitySubtle / opacityScaling;
			const textColour = new Color(textColourHex, textOpacity);

			const userTiming = userPrayerTimes.find((prayerTime) => prayerTime.name.toLowerCase() === prayer.toLowerCase());

			if (!userTiming) return;

			const { name, abbreviation } = userTiming;
			const prayerTitleString = widgetSize === "medium" || widgetSize === "large" ? name.toUpperCase() : abbreviation;

			switch (widgetSize) {
				case "small":
				case "medium":
				case "large":
				case "extraLarge":
					this.addTimeStackInWidget(timingsStack, prayerTitleString, prayerTiming, timingsRowItemSpacing, textColour);
					break;
				case "accessoryCircular":
					this.addTimeStackInAccessoryCircular(timingsStack, prayerTitleString, prayerTiming, textColour);
					break;
				case "accessoryInline":
				case "accessoryRectangular":
					this.addTimeStackInAccessoryInlineRectangle(timingsStack, prayerTitleString, prayerTiming, textColour);
					break;
				default:
					break;
			}
		});

		switch (widgetSize) {
			case "small":
			case "medium":
			case "large":
			case "extraLarge":
				const updatedStack = listWidget.addStack();
				updatedStack.layoutVertically();

				const updatedOn = this.addCenteredTextElementToStack(updatedStack, `${distance} metres`);
				updatedOn.font = new Font("AvenirNext-Regular", 10);
				updatedOn.textColor = new Color(textColourHex, textOpacitySubtle);

				const updatedAt = this.addCenteredTextElementToStack(updatedStack, `${this.dateToString(now)} ${this.convertToLocaleAmPm(now)}`);
				updatedAt.font = new Font("AvenirNext-Regular", 10);
				updatedAt.textColor = new Color(textColourHex, textOpacitySubtle);
				break;
			default:
				break;
		}

		return listWidget;
	}

	private addTimeStackInAccessoryInlineRectangle(
		stack: WidgetStack,
		prayerTitleString: string,
		prayerTiming: WidgetPrayerTiming,
		textColour: Color,
	): WidgetStack {
		const { dateTime, status } = prayerTiming;

		const fontSizeNext = 14;
		const fontSizeDefault = 12;

		let textFont = new Font("AvenirNext-Regular", fontSizeDefault);

		let _textColour;
		if (status && status.state === "future") _textColour = textColour;

		if (status && status.next) {
			textFont = new Font("AvenirNext-Bold", fontSizeNext);
		}

		const timeStack = stack.addStack();

		const _text = timeStack.addText(prayerTitleString);
		_text.font = textFont;
		_text.lineLimit = 1;

		const _date = timeStack.addDate(dateTime);
		_date.font = textFont;
		_date.lineLimit = 1;
		_date.applyTimeStyle();

		if (_textColour) {
			_text.textColor = _textColour;
			_date.textColor = _textColour;
		}

		return timeStack;
	}

	private addTimeStackInAccessoryCircular(
		stack: WidgetStack,
		prayerTitleString: string,
		prayerTiming: WidgetPrayerTiming,
		textColour: Color,
	): WidgetStack {
		const { dateTime, status } = prayerTiming;

		const fontSizeNext = 14;
		const fontSizeDefault = 12;

		let textFont = new Font("AvenirNext-Regular", fontSizeDefault);

		let _textColour;
		if (status && status.state === "future") _textColour = textColour;

		if (status && status.next) {
			textFont = new Font("AvenirNext-Bold", fontSizeNext);
		}

		const timeStack = stack.addStack();
		timeStack.layoutVertically();

		const textStack = timeStack.addStack();
		textStack.addSpacer();
		const _text = textStack.addText(prayerTitleString);
		_text.font = textFont;
		_text.lineLimit = 1;
		textStack.addSpacer();

		const dateStack = timeStack.addStack();
		dateStack.addSpacer();
		const _date = dateStack.addDate(dateTime);
		_date.font = textFont;
		_date.lineLimit = 1;
		_date.minimumScaleFactor = 0.5;
		_date.applyTimeStyle();
		dateStack.addSpacer();

		if (_textColour) {
			_text.textColor = _textColour;
			_date.textColor = _textColour;
		}

		return timeStack;
	}

	private addTimeStackInWidget(
		stack: WidgetStack,
		prayerTitleString: string,
		prayerTiming: WidgetPrayerTiming,
		itemSpacing: number,
		textColour: Color,
	): WidgetStack {
		const { dateTime, status } = prayerTiming;

		const fontSizeNext = 14;
		const fontSizeDefault = 12;

		let textFont = new Font("AvenirNext-Regular", fontSizeDefault);

		let _textColour;
		if (status && status.state === "future") _textColour = textColour;

		if (status && status.next) {
			textFont = new Font("AvenirNext-Bold", fontSizeNext);
		}

		const timeStack = stack.addStack();
		timeStack.spacing = itemSpacing;

		const _text = timeStack.addText(prayerTitleString);
		_text.font = textFont;
		_text.lineLimit = 1;

		timeStack.addSpacer();

		const _date = timeStack.addDate(dateTime);
		_date.font = textFont;
		_date.lineLimit = 1;
		_date.applyTimeStyle();

		if (_textColour) {
			_text.textColor = _textColour;
			_date.textColor = _textColour;
		}

		return timeStack;
	}

	private addCenteredTextElementToStack(stack: WidgetStack, text: string): WidgetText {
		const horizontalStack = stack.addStack();

		horizontalStack.addSpacer();

		const textElement = horizontalStack.addText(text);
		textElement.lineLimit = 1;

		horizontalStack.addSpacer();
		return textElement;
	}

	private getDaysBetweenDates(date1: Date, date2: Date): number {
		const _date1 = new Date(date1);
		const _date2 = new Date(date2);
		const differenceInTime = _date2.getTime() - _date1.getTime();
		const differenceInDays = differenceInTime / (1000 * 60 * 60 * 24);
		return Math.abs(differenceInDays);
	}

	private addStatusToPrayerTimes(prayerTimings: WidgetPrayerTiming[]): WidgetPrayerTiming[] {
		const now = new Date();
		const todayStart = new Date(new Date(now).setHours(0, 0, 0, 0));
		const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

		const nextPrayerIndex = prayerTimings.findIndex((prayerTime) => prayerTime.dateTime > now);

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

	private dateToString(dateString?: Date) {
		const date = dateString ? dateString : new Date();
		return new Date(date)
			.toLocaleString(undefined, {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			})
			.replace(/\//g, "-");
	}

	private convertToLocaleAmPm(
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

	private capitaliseWord(word: string) {
		const firstLetter = word.charAt(0).toUpperCase();
		const rest = word.slice(1).toLowerCase();
		const capitalisedWord = firstLetter + rest;
		return capitalisedWord.trim();
	}

	// Overwrite the default values when running as widget
	private getWidgetArguments(userPreferences: Record<string, any>, argumentNames: string[]) {
		argumentNames.forEach((argumentName) => {
			if (userPreferences[argumentName] && args.widgetParameter.includes(argumentName)) {
				userPreferences[argumentName] = args.widgetParameter[argumentName];
			}
		});
	}
}
