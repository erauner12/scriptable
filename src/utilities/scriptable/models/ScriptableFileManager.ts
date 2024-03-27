export class ScriptableFileManager {
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

	public async saveJSON<TObject extends Object>(
		path: string,
		data: TObject,
		onOverwrite?: (existingFileNameWithoutExtension: string) => string,
	): Promise<string> {
		try {
			const fileContents = JSON.stringify(data, null, 2);
			await this.createDirectoryFromFilePath(path);

			if (!onOverwrite) {
				this.fileManager.writeString(path, fileContents);
				return fileContents;
			}

			const existingFileNameWithoutExtension = this.fileManager.fileName(path);
			const existingFileExtension = this.fileManager.fileExtension(path);

			const newFileNameWithoutExtension = onOverwrite(existingFileNameWithoutExtension);
			const newFileNameWithExtension = newFileNameWithoutExtension + existingFileExtension;
			const newPath = path.replace(existingFileExtension, newFileNameWithExtension);
			this.fileManager.writeString(newPath, fileContents);
			return fileContents;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Joins the given path segments to the documents directory and appends a file extension if provided.
	 *
	 * If the path segments are an array, they are joined in order. If a file extension is provided and doesn't start with a dot, one is prepended.
	 *
	 * @param {string | string[]} pathSegments - A single path segment or an array of path segments to join.
	 * @param {string} [fileExtension] - The file extension to append to the path. A dot is prepended if not present.
	 * @returns {string} The full path combining the documents directory, path segments, and the file extension.
	 *
	 * @example
	 * // Single path segment without an extension
	 * joinDocumentPaths("folder/subfolder", "txt")
	 * // returns "documentsDirectory/folder/subfolder.txt"
	 *
	 * @example
	 * // Multiple path segments with an extension
	 * joinDocumentPaths(["folder", "subfolder", "file"], "txt")
	 * // returns "documentsDirectory/folder/subfolder/file.txt"
	 *
	 * @example
	 * // Extension already starts with a dot
	 * joinDocumentPaths("folder/file", ".txt")
	 * // returns "documentsDirectory/folder/file.txt"
	 */
	public joinDocumentPaths(pathSegments: string | string[], fileExtension?: string): string {
		let fullPath: string;

		if (typeof pathSegments === "string") {
			fullPath = this.fileManager.joinPath(this.documentsDirectory, pathSegments);
		} else {
			fullPath = pathSegments.reduce(
				(accumulatedPath, currentSegment) => this.fileManager.joinPath(accumulatedPath, currentSegment),
				this.documentsDirectory,
			);
		}

		if (fileExtension) {
			// Add a dot if the extension doesn't start with one.
			const formattedExtension = fileExtension.startsWith(".") ? fileExtension : `.${fileExtension}`;
			fullPath += formattedExtension;
		}

		return fullPath;
	}

	private async createDirectoryFromFilePath(path: string, createDirectoryRecursively: boolean = true): Promise<string> {
		if (await this.ensureExists(path)) return path;

		const fileName = this.fileManager.fileName(path, true);
		const directoryPath = path.replace(fileName, "").replace(this.documentsDirectory, "");

		await this.createDirectory(directoryPath, createDirectoryRecursively);
		return path;
	}

	public async createDirectory(directoryPath: string, createDirectoryRecursively: boolean): Promise<string> {
		try {
			const path = this.fileManager.joinPath(this.documentsDirectory, directoryPath);

			if (await this.ensureExists(path)) {
				if (this.fileManager.isDirectory(path)) {
					return path;
				} else {
					throw new Error("A file with the same name already exists.");
				}
			} else {
				this.fileManager.createDirectory(path, createDirectoryRecursively);
				return path;
			}
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
