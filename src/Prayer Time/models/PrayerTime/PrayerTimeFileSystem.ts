import { PrayerTimeBase } from "src/Prayer Time/models/PrayerTime/PrayerTimeBase";
import type { WidgetPreferences } from "src/Prayer Time/types";
import type { DeepPartial } from "src/types/helpers";
import { mergeDeep } from "src/utilities/mergeDeep";
import { ScriptableFileManager } from "src/utilities/scriptable/models/ScriptableFileManager";

export class PrayerTimeFileSystem extends PrayerTimeBase {
	protected fileManager: ScriptableFileManager;
	protected filePath: string;

	constructor(userPreferences: DeepPartial<WidgetPreferences>) {
		super(userPreferences);
		this.fileManager = new ScriptableFileManager();
		this.filePath = this.fileManager.joinDocumentPaths([Script.name(), Script.name()], ".json");
	}

	protected async savePreferences(preferences: WidgetPreferences): Promise<void> {
		this.preferences = preferences; // Update the preferences in memory
		await this.fileManager.saveJSON(this.filePath, preferences);
	}

	protected async mergeAndSavePreferences(sourcePreferences: DeepPartial<WidgetPreferences>): Promise<void> {
		const mergedPreferences = mergeDeep(this.preferences, sourcePreferences);
		await this.savePreferences(mergedPreferences);
	}

	protected async loadPreferences(): Promise<WidgetPreferences> {
		return await this.fileManager.readJSON(this.filePath);
	}
}
