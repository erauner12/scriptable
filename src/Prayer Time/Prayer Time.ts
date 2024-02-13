import { APIData, Preferences } from "./types";

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
		endpoint: "http://api.aladhan.com/v1/timings/",
		location: {
			latitude: 38.70977051985349,
			longitude: -9.135920391030602,
		},
	},
};

(async () => {
	await runScript();
})();

async function runScript() {
	const deviceOnline = await isOnline();

	if (deviceOnline) {
		const response = await getNewData(PREFERENCES);
		await saveNewData(PREFERENCES, response);
	}

	const data = await loadData(PREFERENCES);

	if (data) {
		presentData(data, PREFERENCES);
	}
}

function createWidget(timings: [string, string][]) {
	const horizontalSpacing = 6;

	const listWidget = new ListWidget();

	const mainStack = listWidget.addStack();
	mainStack.layoutVertically();
	mainStack.centerAlignContent();

	let rowStack = addRowStack(mainStack, horizontalSpacing);

	timings.forEach((timing, index) => {
		const [text, time] = timing;

		const display = PREFERENCES.widget.display.prayerTimes.find(
			(prayerTime) => prayerTime.name.toLowerCase() === text.toLowerCase()
		);

		if (display) {
			addTimeStack(rowStack, text, display.display, time);
		}

		rowStack = addRowStack(mainStack, horizontalSpacing);
	});

	listWidget.presentSmall();
}

function addRowStack(mainStack: WidgetStack, horizontalSpacing: number): WidgetStack {
	const rowStack = mainStack.addStack();
	rowStack.spacing = horizontalSpacing;
	rowStack.centerAlignContent();
	return rowStack;
}

function addTimeStack(stack: WidgetStack, text: string, display: string, date: string): WidgetStack {
	const timeStack = stack.addStack();

	timeStack.spacing = 2;
	timeStack.layoutVertically();
	timeStack.centerAlignContent();

	const title = addCenteredTextElementToStack(timeStack, text);
	title.font = new Font("AvenirNext-Bold", 16);

	const icon = addCenteredTextElementToStack(timeStack, display);
	icon.font = new Font("AvenirNext-Regular", 16);

	const time = addCenteredTextElementToStack(timeStack, date);
	time.font = new Font("AvenirNext-Medium", 16);

	return timeStack;
}

function addCenteredTextElementToStack(stack: WidgetStack, text: string): WidgetText {
	const horizontalStack = stack.addStack();

	horizontalStack.addSpacer();

	const textElement = horizontalStack.addText(text);
	textElement.lineLimit = 1;

	horizontalStack.addSpacer();
	return textElement;
}

function presentData(days: APIData[], preferences: Preferences) {
	const {
		widget: {
			display: { prayerTimes },
		},
	} = preferences;
	const itemsToShow = 2;
	const currentDateTime = new Date();

	const displayKeys = prayerTimes.map((prayerTime) => {
		return prayerTime.name.toUpperCase();
	});

	const prayerTimesArray = days
		.map((day) => convertTimingsToDateArray(day))
		.flat()
		.filter((prayerTime) => displayKeys.includes(prayerTime.prayer.toUpperCase()))
		.filter((prayerTime) => prayerTime.time > currentDateTime)
		.sort((dateA, dateB) => dateA.time.getTime() - dateB.time.getTime())
		.slice(0, itemsToShow);

	// createWidget(displayTimings);
}

type Timing = { prayer: string; time: Date };

function convertTimingsToDateArray(day: APIData): Timing[] {
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

function getDay(data: APIData[], dayDate?: Date) {
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

async function isOnline() {
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

function removeDuplicateData(array: APIData[]): APIData[] {
	const newArray: APIData[] = [];
	array.forEach((object) => {
		if (!newArray.some((o) => JSON.stringify(o) === JSON.stringify(object))) {
			newArray.push(object);
		}
	});
	return newArray;
}

async function saveNewData(preferences: Preferences, data: APIData[]) {
	const newData: APIData[] = data;
	const offlineData: APIData[] = await loadData(preferences);
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
			max.setDate(today.getDate() + preferences.widget.settings.offline);
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

	saveData(preferences, mergedData);
}

async function getNewData(preferences: Preferences) {
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

async function getData(url: string) {
	const request = new Request(url);
	const response = await request.loadJSON();
	return response;
}

function getUrl(
	endpoint: string,
	date: Date,
	parameters: Record<string, string | number | boolean | null | undefined>
): string {
	const dateString = dateToString(date);
	const baseUrl = `${endpoint}${dateString}`;
	const urlWithParameters = appendQueryParameter(baseUrl, parameters);
	return encodeURI(urlWithParameters);
}

function stringToDate(dateString: string) {
	const [day, month, year] = dateString.split("-");
	const date = new Date(Number(year), Number(month) - 1, Number(day));
	date.setHours(0, 0, 0, 0);
	return date;
}

function dateToString(dateString?: Date) {
	const date = dateString ? dateString : new Date();
	return new Date(date)
		.toLocaleString(undefined, {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		})
		.replace(/\//g, "-");
}

function capitaliseWord(word: string) {
	const firstLetter = word.charAt(0).toUpperCase();
	const rest = word.slice(1).toLowerCase();
	const capitalisedWord = firstLetter + rest;
	return capitalisedWord.trim();
}

// Overwrite the default values when running as widget
function getWidgetArguments(userPreferences: Record<string, any>, argumentNames: string[]) {
	argumentNames.forEach((argumentName) => {
		if (userPreferences[argumentName] && args.widgetParameter.includes(argumentName)) {
			userPreferences[argumentName] = args.widgetParameter[argumentName];
		}
	});
}

// Gets the path of the file containing the stored "Prayer Time" data. Creates the file if it doesn't exist.
function getFilePath(preferences: Preferences) {
	const fileName = `${preferences.widget.settings.file}.json`;
	const directoryName = preferences.widget.settings.directory;
	const fm = FileManager.iCloud();
	const dirPath = fm.joinPath(fm.documentsDirectory(), directoryName);

	if (!fm.fileExists(dirPath)) {
		fm.createDirectory(dirPath);
	}

	return fm.joinPath(dirPath, fileName);
}

// Loads data stored in the .json file
async function loadData(preferences: Preferences) {
	let fm = FileManager.iCloud();
	let path = getFilePath(preferences);

	if (fm.fileExists(path)) {
		if (!fm.isFileDownloaded(path)) await fm.downloadFileFromiCloud(path);
		const raw = fm.readString(path);
		const data: APIData[] = JSON.parse(raw);
		return data;
	} else {
		const data: APIData[] = [];
		return data;
	}
}

// Saves the data to a file in iCloud Drive
function saveData(preferences: Preferences, data: object) {
	let fm = FileManager.iCloud();
	let path = getFilePath(preferences);
	let raw = JSON.stringify(data, null, 2);
	fm.writeString(path, raw);
}

function appendQueryParameter(
	url: string,
	parameters: Record<string, string | number | boolean | null | undefined>
): string {
	let hasQuery: boolean = url.includes("?");

	for (const key in parameters) {
		// Check if the property/key is defined in the object itself, not in parent prototypes
		if (parameters.hasOwnProperty(key)) {
			const value = parameters[key];

			if (value !== null && value !== undefined) {
				url += (hasQuery ? "&" : "?") + encodeURIComponent(key) + "=" + encodeURIComponent(value.toString());
				hasQuery = true; // Subsequent parameters should use '&' instead of '?'
			}
		}
	}

	return url;
}
