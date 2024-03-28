import { displayApp } from "src/Prayer Time/app";
import PrayerTime from "src/Prayer Time/models/PrayerTime";
import type { WidgetPreferences } from "src/Prayer Time/types";
import type { DeepPartial } from "src/types/helpers";
import { ScriptableFileManager, getRunLocation, handleError } from "src/utilities";

(async () => {
	await runScript();
})();

async function runScript() {
	const runLocation = getRunLocation();

	try {
		const fileManager = new ScriptableFileManager();
		const filePath = fileManager.joinDocumentPaths([Script.name(), Script.name()], ".json");
		const userPreferences = await fileManager.readJSON<DeepPartial<WidgetPreferences>>(filePath);

		const prayerTime = new PrayerTime(userPreferences);
		await prayerTime.initialise(async (PrayerTime) => await PrayerTime.setup());
		await prayerTime.setup();

		switch (runLocation) {
			case "App":
				await displayApp();
				break;
			case "ActionExtension":
				break;
			case "HomeScreen":
			case "Widget":
				await prayerTime.displayWidget();
				break;
			default:
				break;
		}

		Script.complete();
	} catch (error) {
		throw handleError(error);
	}
}
