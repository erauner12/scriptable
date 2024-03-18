class ScriptableFileManager {
	protected fileManager: FileManager;
	protected documentsDirectory: string;

	constructor() {
		this.fileManager = FileManager.iCloud() || FileManager.local();
		this.documentsDirectory = this.fileManager.documentsDirectory();
	}

	public async readJSON(path: string): Promise<any> {
		try {
			if (await this.ensureExists(path)) {
				const fileContents = this.fileManager.readString(path);
				return JSON.parse(fileContents);
			}
		} catch (error) {
			this.handleError(error);
		}
	}

	public async saveJSON(
		fileNameWithExtension: string,
		directoryName: string,
		data: object,
		onOverwrite?: (existingFileNameWithoutExtension: string) => string,
	): Promise<void> {
		try {
			const path = await this.getFilePath(fileNameWithExtension, directoryName, true);
			const fileContents = JSON.stringify(data, null, 2);

			if (!onOverwrite) {
				this.fileManager.writeString(path, fileContents);
			}

			if (onOverwrite) {
				const existingFileNameWithoutExtension = this.fileManager.fileName(path);
				const existingFileExtension = this.fileManager.fileExtension(path);

				const newFileNameWithoutExtension = onOverwrite(existingFileNameWithoutExtension);
				const newFileNameWithExtension = newFileNameWithoutExtension + existingFileExtension;
				const newPath = await this.getFilePath(newFileNameWithExtension, directoryName, true);
				this.fileManager.writeString(newPath, fileContents);
			}
		} catch (error) {
			throw this.handleError(error);
		}
	}

	private async getFilePath(
		fileNameWithExtension: string,
		directoryName: string,
		createDirectoryRecursively: boolean = true,
	): Promise<string> {
		const path = this.fileManager.joinPath(directoryName, fileNameWithExtension);
		if (await this.ensureExists(path)) return path;

		await this.createDirectory(directoryName, createDirectoryRecursively);
		return path;
	}

	private async createDirectory(directoryName: string, createDirectoryRecursively: boolean): Promise<string> {
		try {
			const directoryPath = this.fileManager.joinPath(this.documentsDirectory, directoryName);

			if (!(await this.ensureExists(directoryPath))) {
				this.fileManager.createDirectory(directoryPath, createDirectoryRecursively);
			}

			return directoryPath;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	private async ensureExists(path: string): Promise<boolean> {
		if (!this.fileManager.fileExists(path)) {
			return false;
		}

		if (!this.fileManager.isFileDownloaded(path)) {
			await this.fileManager.downloadFileFromiCloud(path);
		}

		if (this.fileManager.isFileDownloaded(path)) {
			return true;
		} else {
			throw new Error("Unable to download file.");
		}
	}

	private handleError(error: unknown) {
		if (error instanceof Error) {
			return new Error(error.message);
		} else {
			return new Error(String(error));
		}
	}
}
