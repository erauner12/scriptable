import { APIData, Preferences } from "./types";

const PREFERENCES: Preferences = {
	widget: {
		settings: {
			file: "Prayer Time",
			directory: "Prayer Time",
			size: "small",
			offline: 3,
		},
	},
	api: {
		endpoint: "http://api.aladhan.com/v1/timings/",
		method: 2,
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
	const data = await getNewData(PREFERENCES);
	await saveNewData(PREFERENCES, data);
	console.log(data);
}

function removeDuplicateData(array: Array<APIData>): Array<APIData> {
	const newArray: Array<APIData> = [];
	array.forEach((object) => {
		if (!newArray.some((o) => JSON.stringify(o) === JSON.stringify(object))) {
			newArray.push(object);
		}
	});
	return newArray;
}

async function saveNewData(preferences: Preferences, data: Array<APIData>) {
	const newData: Array<APIData> = data;
	const offlineData: Array<APIData> = await loadData(preferences);
	const mergedData: Array<APIData> = [];

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
	const offlineDays = preferences.widget.settings.offline;
	const offlineData: Array<APIData> = [];
	for (let day = 0; day < offlineDays; day++) {
		const date = new Date();
		date.setDate(date.getDate() + day);
		const url = getUrl(preferences, date);
		const response = await getData(url);
		const data = response.data;
		offlineData.push(data);
	}
	return offlineData;
}

async function getData(url: string) {
	const request = new Request(url);
	const response = await request.loadJSON();
	return response;
}

function getUrl(preferences: Preferences, date: Date) {
	const api = preferences.api;
	const currentDate = dateToString(date);
	const urlString = `${api.endpoint}${currentDate}?latitude=${api.location.latitude}&longitude=${api.location.longitude}&method=${api.method}`;
	return urlString;
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

// Overwrite the default values when running as widget
function getWidgetArguments(preferences: Preferences) {
	if (args.widgetParameter) {
		if (args.widgetParameter.includes("method")) {
			preferences.api.method = 2;
		}
		if (args.widgetParameter.includes("latitude")) {
			preferences.api.location.latitude = 10;
		}
		if (args.widgetParameter.includes("latitude")) {
			preferences.api.location.longitude = 0;
		}
	}
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
		const data: Array<APIData> = JSON.parse(raw);
		return data;
	} else {
		const data: Array<APIData> = [];
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
