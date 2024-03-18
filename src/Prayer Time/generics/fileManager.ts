// Loads data stored in the .json file
export async function loadData(path: string): Promise<any> {
	let fm = FileManager.iCloud();

	if (fm.fileExists(path)) {
		if (!fm.isFileDownloaded(path)) await fm.downloadFileFromiCloud(path);
		const raw = fm.readString(path);
		const data = JSON.parse(raw);
		return data;
	}
}

// Saves the data to a file in iCloud Drive
export function saveData(path: string, data: object): void {
	let fm = FileManager.iCloud();
	let raw = JSON.stringify(data, null, 2);
	fm.writeString(path, raw);
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
