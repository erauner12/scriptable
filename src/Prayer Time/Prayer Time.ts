import { PrayerTimeWidget } from "src/Prayer Time/models/PrayerTimeWidget";
import { handleError } from "src/utilities/handleError";
import { ScriptableFileManager } from "src/utilities/scriptable/models/ScriptableFileManager";

(async () => {
	await runScript();
})();

async function runScript() {
	try {
		const fileManager = new ScriptableFileManager();
		const filePath = fileManager.joinDocumentPaths([Script.name(), Script.name()], ".json");
		const userPreferences = await fileManager.readJSON(filePath);

		const prayerTime = new PrayerTimeWidget(userPreferences);
		await prayerTime.setup();
	} catch (error) {
		throw handleError(error);
	}
}
