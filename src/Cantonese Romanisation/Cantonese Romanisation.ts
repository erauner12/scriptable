import { CantoneseTransformer } from "Cantonese Romanisation/models/CantoneseTransformer";
import { type CantoneseRomanisationSystemName } from "Cantonese Romanisation/types/CantoneseRomanisationSystems";
import { type LocalisationName } from "Cantonese Romanisation/types/Localisations";
import { getRunLocation } from "utilities/scriptable/getRunLocation";

type Settings = {
	language: LocalisationName;
	inputRomanisationSystem: CantoneseRomanisationSystemName;
	outputRomanisationSystem: CantoneseRomanisationSystemName;
};

const DEFAULT_SETTINGS: Settings = {
	language: "en",
	inputRomanisationSystem: "jyutping",
	outputRomanisationSystem: "jyutping",
};

runWidget(DEFAULT_SETTINGS);

async function runWidget(defaultSettings: Settings) {
	const shareSheetInputText = args.plainTexts[0];

	const runLocation = getRunLocation();
	const { language, inputRomanisationSystem, outputRomanisationSystem } =
		defaultSettings;

	const cantoneseTransformer = new CantoneseTransformer(
		language,
		inputRomanisationSystem,
		outputRomanisationSystem
	);

	switch (runLocation) {
		case "App":
			settingsMenu(cantoneseTransformer);
			break;
		case "ActionExtension":
			if (shareSheetInputText)
				parseAndPrompt(cantoneseTransformer, shareSheetInputText);
			await alertError(cantoneseTransformer);
			break;
		case "HomeScreen":
			await parseAndPrompt(cantoneseTransformer, Pasteboard.paste());
			break;
		default:
			break;
	}
}

async function settingsMenu(CantoneseTransformer: CantoneseTransformer) {
	const localisations = CantoneseTransformer.getLocalisations();
	const {
		settings,
		outputRomanisationSystem,
		inputRomanisationSystem,
		convert,
	} = CantoneseTransformer.getLocalisation();
	const runLocation = getRunLocation();

	const alert = new Alert();
	alert.title = String(settings);
	alert.addAction(
		Object.values(localisations)
			.map((localisation) => localisation.language)
			.join(" / ")
	);
	alert.addAction(inputRomanisationSystem);
	alert.addAction(outputRomanisationSystem);
	alert.addAction(`${convert} 🔄`);
	if (runLocation === "App") alert.addAction("From Clipboard 📋");

	const selectionIndex = await alert.present();

	if (selectionIndex === 0) await selectLanguage(CantoneseTransformer);
	if (selectionIndex === 1)
		await selectInputRomanisationSystem(CantoneseTransformer);
	if (selectionIndex === 2)
		await selectOutputRomanisationSystem(CantoneseTransformer);
	if (selectionIndex === 3)
		parseAndPrompt(CantoneseTransformer, Pasteboard.paste());
	if (selectionIndex === 4)
		await parseAndPrompt(CantoneseTransformer, Pasteboard.paste());
}

async function selectLanguage(CantoneseTransformer: CantoneseTransformer) {
	const localisations = CantoneseTransformer.getLocalisations();
	const { languageName: currentLanguageName } =
		CantoneseTransformer.getLocalisation();

	const alert = new Alert();
	alert.title = Object.values(localisations)
		.map((localisation) => localisation.language)
		.join(" / ");
	Object.values(localisations).forEach((localisation) => {
		const { languageName } = localisation;
		const isSelected = currentLanguageName === languageName;
		const alertActionText = isSelected ? `${languageName} ✅` : languageName;
		alert.addAction(alertActionText);
	});

	const selectionIndex = await alert.presentAlert();
	const selectedKey = Object.keys(localisations)[
		selectionIndex
	] as LocalisationName;

	if (!selectedKey) return;

	CantoneseTransformer.setLocalisation(selectedKey);
	await settingsMenu(CantoneseTransformer);
}

async function selectOutputRomanisationSystem(
	CantoneseTransformer: CantoneseTransformer
) {
	const { romanisationSystems, outputRomanisationSystem } =
		CantoneseTransformer.getLocalisation();
	const selectedRomanisationSystem =
		CantoneseTransformer.getOutputRomanisationSystem();

	const alert = new Alert();
	alert.title = outputRomanisationSystem;

	Object.entries(romanisationSystems).forEach(
		([key, romanisationSystemName]) => {
			const isSelected = selectedRomanisationSystem === key;
			const alertActionText = isSelected
				? `${romanisationSystemName} ✅`
				: romanisationSystemName;
			alert.addAction(alertActionText);
		}
	);

	const selectionIndex = await alert.present();
	const selectionKey = Object.keys(romanisationSystems)[
		selectionIndex
	] as CantoneseRomanisationSystemName;

	if (!selectionKey) return;

	CantoneseTransformer.setOutputRomanisationSystem(selectionKey);
	await settingsMenu(CantoneseTransformer);
}

async function selectInputRomanisationSystem(
	CantoneseTransformer: CantoneseTransformer
) {
	const { romanisationSystems, inputRomanisationSystem } =
		CantoneseTransformer.getLocalisation();
	const selectedRomanisationSystem =
		CantoneseTransformer.getInputRomanisationSystem();

	const alert = new Alert();
	alert.title = inputRomanisationSystem;

	Object.entries(romanisationSystems).forEach(
		([key, romanisationSystemName]) => {
			const isSelected = selectedRomanisationSystem === key;
			const alertActionText = isSelected
				? `${romanisationSystemName} ✅`
				: romanisationSystemName;
			alert.addAction(alertActionText);
		}
	);

	const selectionIndex = await alert.present();
	const selectionKey = Object.keys(romanisationSystems)[
		selectionIndex
	] as CantoneseRomanisationSystemName;

	if (!selectionKey) return;

	CantoneseTransformer.setInputRomanisationSystem(selectionKey);
	await settingsMenu(CantoneseTransformer);
}

async function parseAndPrompt(
	CantoneseTransformer: CantoneseTransformer,
	chineseCharacterString: string
) {
	const jyutping = CantoneseTransformer.toJyutping(chineseCharacterString);

	if (
		CantoneseTransformer.getInputRomanisationSystem() !==
		CantoneseTransformer.getOutputRomanisationSystem()
	) {
		const romanisation =
			CantoneseTransformer.transformRomanisationSystem(jyutping);
		await prompt(chineseCharacterString, romanisation);
		return;
	}

	await prompt(chineseCharacterString, jyutping);
}

async function prompt(title: string, message: string) {
	let alert = new Alert();
	alert.title = title;
	alert.message = message;
	alert.addAction("➡️📋");
	alert.addAction("📋➡️");
	alert.addAction("✅");

	const selectionIndex = await alert.present();

	if (selectionIndex === 0) Pasteboard.copy(title);
	if (selectionIndex === 1) Pasteboard.copy(message);
	if (selectionIndex === 2) Script.complete();
}

async function alertError(CantoneseTransformer: CantoneseTransformer) {
	const { convert, input } = CantoneseTransformer.getLocalisation();

	const alert = new Alert();
	alert.title = `${convert} 🔄`;
	alert.addTextField(input);
	alert.addAction("Submit");
	alert.addCancelAction("Cancel");

	const selectionIndex = await alert.present();
	if (selectionIndex === 0)
		parseAndPrompt(CantoneseTransformer, alert.textFieldValue(0));
}
