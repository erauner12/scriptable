import { CantoneseTransformer } from "src/Cantonese Romanisation/models/CantoneseTransformer";
import { type CantoneseRomanisationSystemName } from "src/Cantonese Romanisation/types/CantoneseRomanisationSystems";
import { type LocalisationName } from "src/Cantonese Romanisation/types/Localisations";
import { getRunLocation } from "src/utilities/scriptable/getRunLocation";

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
			presentTextInput(cantoneseTransformer);
			break;
		case "ActionExtension":
			if (shareSheetInputText)
				parseAndPrompt(cantoneseTransformer, shareSheetInputText);
			await presentTextInput(cantoneseTransformer);
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

	const alert = new Alert();
	alert.title = settings;
	alert.addAction(
		Object.values(localisations)
			.map((localisation) => localisation.language)
			.join(" / ")
	);
	alert.addAction(inputRomanisationSystem);
	alert.addAction(outputRomanisationSystem);
	alert.addAction(`${convert} 🔄`);

	const selectionIndex = await alert.presentAlert();

	if (selectionIndex === 0) await selectLanguage(CantoneseTransformer);
	if (selectionIndex === 1)
		await selectInputRomanisationSystem(CantoneseTransformer);
	if (selectionIndex === 2)
		await selectOutputRomanisationSystem(CantoneseTransformer);
	if (selectionIndex === 3) presentTextInput(CantoneseTransformer);
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

	const selectionIndex = await alert.presentAlert();
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

	const selectionIndex = await alert.presentAlert();
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
		await prompt(CantoneseTransformer, chineseCharacterString, romanisation);
		return;
	}

	await prompt(CantoneseTransformer, chineseCharacterString, jyutping);
}

async function presentTextInput(CantoneseTransformer: CantoneseTransformer) {
	const { convert, input, done, submit, settings } =
		CantoneseTransformer.getLocalisation();

	const alert = new Alert();
	alert.title = `${convert} 🔄`;
	alert.addTextField(input);
	alert.addAction(`${submit} ✅`);
	alert.addAction("From Clipboard 📋"); // TODO Add localisation for "From Clipboard"
	alert.addAction(`${settings} ⚙️`);
	alert.addCancelAction(`${done}`);

	const selectionIndex = await alert.presentAlert();
	if (selectionIndex === 0)
		parseAndPrompt(CantoneseTransformer, alert.textFieldValue(0));
	if (selectionIndex === 1)
		await parseAndPrompt(CantoneseTransformer, Pasteboard.paste());
	if (selectionIndex === 2) await settingsMenu(CantoneseTransformer);
}

async function prompt(
	CantoneseTransformer: CantoneseTransformer,
	originalText: string,
	message: string
) {
	const { done, convert, settings } = CantoneseTransformer.getLocalisation();

	const alert = new Alert();
	alert.title = originalText;
	alert.message = message;
	alert.addAction("➡️📋"); // TODO Add localisation for "Copy original"
	alert.addAction("📋➡️"); // TODO Add localisation for "Copy romanisation"
	alert.addAction(`${convert} 🔄`);
	alert.addAction(`${settings} ⚙️`);
	alert.addAction(done);

	const selectionIndex = await alert.presentAlert();

	if (selectionIndex === 0) Pasteboard.copy(originalText);
	if (selectionIndex === 1) Pasteboard.copy(message);
	if (selectionIndex === 2) await presentTextInput(CantoneseTransformer);
	if (selectionIndex === 3) await settingsMenu(CantoneseTransformer);
	if (selectionIndex === 4) Script.complete();
}
