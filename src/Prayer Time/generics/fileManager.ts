// Loads data stored in the .json file
export async function loadData(path: string) {
	let fm = FileManager.iCloud();

	if (fm.fileExists(path)) {
		if (!fm.isFileDownloaded(path)) await fm.downloadFileFromiCloud(path);
		const raw = fm.readString(path);
		const data = JSON.parse(raw);
		return data;
	} else {
		const data: any = [];
		return data;
	}
}

// Saves the data to a file in iCloud Drive
export function saveData(path: string, data: object) {
	let fm = FileManager.iCloud();
	let raw = JSON.stringify(data, null, 2);
	fm.writeString(path, raw);
}
