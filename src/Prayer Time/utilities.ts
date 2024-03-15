export async function isOnline() {
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

export function getUrl(
	endpoint: string,
	date: Date,
	parameters: Record<string, string | number | boolean | null | undefined>
): string {
	const dateString = dateToString(date);
	const baseUrl = `${endpoint}${dateString}`;
	const urlWithParameters = appendQueryParameter(baseUrl, parameters);
	return encodeURI(urlWithParameters);
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
				url +=
					(hasQuery ? "&" : "?") +
					encodeURIComponent(key) +
					"=" +
					encodeURIComponent(value.toString());
				hasQuery = true; // Subsequent parameters should use '&' instead of '?'
			}
		}
	}

	return url;
}

export function stringToDate(dateString: string) {
	const [day, month, year] = dateString.split("-");
	const date = new Date(Number(year), Number(month) - 1, Number(day));
	date.setHours(0, 0, 0, 0);
	return date;
}

export function dateToString(dateString?: Date) {
	const date = dateString ? dateString : new Date();
	return new Date(date)
		.toLocaleString(undefined, {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		})
		.replace(/\//g, "-");
}

export function convertToLocaleAmPm(
	date: Date,
	options: Intl.DateTimeFormatOptions | undefined = {
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	}
): string {
	const localAmPmTime = date
		.toLocaleTimeString(undefined, options)
		.toUpperCase();
	return localAmPmTime;
}

export function capitaliseWord(word: string) {
	const firstLetter = word.charAt(0).toUpperCase();
	const rest = word.slice(1).toLowerCase();
	const capitalisedWord = firstLetter + rest;
	return capitalisedWord.trim();
}

// Overwrite the default values when running as widget
export function getWidgetArguments(
	userPreferences: Record<string, any>,
	argumentNames: string[]
) {
	argumentNames.forEach((argumentName) => {
		if (
			userPreferences[argumentName] &&
			args.widgetParameter.includes(argumentName)
		) {
			userPreferences[argumentName] = args.widgetParameter[argumentName];
		}
	});
}

// Gets the path of the file containing the stored "Prayer Time" data. Creates the file if it doesn't exist.
export function getFilePath(fileName: string, directoryName: string) {
	const file = `${fileName}.json`;
	const directory = directoryName;
	const fm = FileManager.iCloud();
	const dirPath = fm.joinPath(fm.documentsDirectory(), directory);

	if (!fm.fileExists(dirPath)) {
		fm.createDirectory(dirPath);
	}

	return fm.joinPath(dirPath, file);
}

export function calculateDistance(
	point1: { latitude: number; longitude: number },
	point2: { latitude: number; longitude: number }
) {
	const R = 6371; // Radius of the Earth in km
	const radians = (degrees: number) => degrees * (Math.PI / 180); // Convert degrees to radians

	// Difference in coordinates
	const deltaLat = radians(point2.latitude - point1.latitude);
	const deltaLon = radians(point2.longitude - point1.longitude);

	// Apply Haversine formula
	const a =
		Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
		Math.cos(radians(point1.latitude)) *
			Math.cos(radians(point2.latitude)) *
			Math.sin(deltaLon / 2) *
			Math.sin(deltaLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	const distance = R * c; // Distance in km
	return distance * 1000; // Distance in metres
}

export function roundToTwoDecimals(number: number) {
	return Math.round((number + Number.EPSILON) * 100) / 100;
}
