import PrayerTime from "src/Prayer Time/models/PrayerTime";
import { ScriptableFileManager, handleError } from "src/utilities";

(async () => {
	await runScript();
})();

async function runScript() {
	try {
		const fileManager = new ScriptableFileManager();
		const filePath = fileManager.joinDocumentPaths([Script.name(), Script.name()], ".json");
		const userPreferences = await fileManager.readJSON(filePath);

		const prayerTime = new PrayerTime(userPreferences);
		await prayerTime.initialise(async (PrayerTime) => await PrayerTime.setup());
		await prayerTime.setup();
		await prayerTime.displayWidget();
		Script.complete();
	} catch (error) {
		throw handleError(error);
	}
}
