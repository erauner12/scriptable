import { CantoneseTransformer } from "src/Cantonese Romanisation/models/CantoneseTransformer";
import { type CantoneseRomanisationSystemName } from "src/Cantonese Romanisation/types/CantoneseRomanisationSystems";
import { type LocalisationName } from "src/Cantonese Romanisation/types/Localisations";
import { getRunLocation } from "src/utilities/scriptable/getRunLocation";
import {
	presentAlertActions,
	type PresentAlertActions,
} from "src/utilities/scriptable/presentAlertActions";

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
			await presentTextInput(cantoneseTransformer);
			break;
		case "ActionExtension":
			const shareSheetInputText = args.plainTexts[0];
			if (shareSheetInputText) {
				await parseAndPrompt(cantoneseTransformer, shareSheetInputText);
				break;
			}
			await presentTextInput(cantoneseTransformer);
			break;
		case "HomeScreen":
			await parseAndPrompt(cantoneseTransformer, Pasteboard.paste());
			break;
		case "Widget":
			await presentWidgetWordOfTheDay(cantoneseTransformer);
			break;
		default:
			break;
	}
}

async function presentWidgetWordOfTheDay(
	CantoneseTransformer: CantoneseTransformer
) {
	const wordOfTheDay = CantoneseTransformer.getWordOfTheDay();

	if (!wordOfTheDay) throw new Error("Could not get word of the day.");

	const widget = new ListWidget();
	widget.setPadding(10, 16, 16, 16);

	const widgetStack = widget.addStack();
	widgetStack.layoutVertically();

	Object.entries(wordOfTheDay).forEach(([chinese, romanisations]) => {
		const titleStack = widgetStack.addStack();

		titleStack.addSpacer();
		const titleText = titleStack.addText(chinese);
		titleText.font = new Font("PingFangHK-Regular", 42);
		titleText.minimumScaleFactor = 0.5;
		titleText.textOpacity = 0.8;
		titleStack.addSpacer();

		const romanisationStack = widgetStack.addStack();
		romanisationStack.addSpacer();
		const romanisationText = romanisationStack.addText(
			romanisations.join(", ")
		);
		romanisationText.font = new Font("PingFangHK-Semibold", 24);
		romanisationText.minimumScaleFactor = 0.5;
		romanisationText.centerAlignText();
		romanisationStack.addSpacer();
	});

	widget.presentSmall();
}

async function parseAndPrompt(
	CantoneseTransformer: CantoneseTransformer,
	chineseCharacterString: string
) {
	const romanisation = CantoneseTransformer.convertToRomanisation(
		chineseCharacterString
	);
	await prompt(CantoneseTransformer, chineseCharacterString, romanisation);
}

async function settingsMenu(CantoneseTransformer: CantoneseTransformer) {
	const localisations = CantoneseTransformer.getLocalisations();
	const { settings, outputRomanisationSystem, convert, done } =
		CantoneseTransformer.getLocalisation();
	const language = Object.values(localisations)
		.map((localisation) => localisation.language)
		.join(" / ");

	const alert = new Alert();
	alert.title = settings;

	await presentAlertActions(alert, {
		[language]: async () => await selectLanguage(CantoneseTransformer),
		[outputRomanisationSystem]: async () =>
			await selectOutputRomanisationSystem(CantoneseTransformer),
		[`${convert} 🔄`]: async () => presentTextInput(CantoneseTransformer),
		["Show Widget"]: async () =>
			presentWidgetWordOfTheDay(CantoneseTransformer), // TODO Add localisation for "Show widget"
		[done]: () => Script.complete(),
	});
}

async function selectLanguage(CantoneseTransformer: CantoneseTransformer) {
	const localisations = CantoneseTransformer.getLocalisations();
	const { languageName: currentLanguageName } =
		CantoneseTransformer.getLocalisation();
	const language = Object.values(localisations)
		.map((localisation) => localisation.language)
		.join(" / ");

	const alert = new Alert();
	alert.title = language;
	const actions: PresentAlertActions = Object.fromEntries(
		Object.entries(localisations).map(([key, localisation]) => {
			const { languageName } = localisation;
			const isSelected = currentLanguageName === languageName;
			const alertActionText = isSelected ? `${languageName} ✅` : languageName;
			return [
				alertActionText,
				() => CantoneseTransformer.setLocalisation(key as LocalisationName),
			];
		})
	);
	await presentAlertActions(alert, actions);

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
	const actions: PresentAlertActions = Object.fromEntries(
		Object.entries(romanisationSystems).map(([key, romanisationSystemName]) => {
			const isSelected = selectedRomanisationSystem === key;
			const alertActionText = isSelected
				? `${romanisationSystemName} ✅`
				: romanisationSystemName;
			return [
				alertActionText,
				() =>
					CantoneseTransformer.setOutputRomanisationSystem(
						key as CantoneseRomanisationSystemName
					),
			];
		})
	);
	await presentAlertActions(alert, actions);

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

	const actions: PresentAlertActions = Object.fromEntries(
		Object.entries(romanisationSystems).map(([key, romanisationSystemName]) => {
			const isSelected = selectedRomanisationSystem === key;
			const alertActionText = isSelected
				? `${romanisationSystemName} ✅`
				: romanisationSystemName;
			return [
				alertActionText,
				() =>
					CantoneseTransformer.setInputRomanisationSystem(
						key as CantoneseRomanisationSystemName
					),
			];
		})
	);
	await presentAlertActions(alert, actions);

	await settingsMenu(CantoneseTransformer);
}

async function presentTextInput(CantoneseTransformer: CantoneseTransformer) {
	const { convert, input, done, submit, settings } =
		CantoneseTransformer.getLocalisation();

	const alert = new Alert();
	alert.title = `${convert} 🔄`;
	alert.addTextField(input);

	presentAlertActions(alert, {
		[`${submit} ✅`]: async () =>
			await parseAndPrompt(CantoneseTransformer, alert.textFieldValue(0)),
		["From Clipboard 📋"]: async () =>
			await parseAndPrompt(CantoneseTransformer, Pasteboard.paste()), // TODO Add localisation for "From Clipboard"
		[`${settings} ⚙️`]: async () => await settingsMenu(CantoneseTransformer),
		[done]: () => Script.complete(),
	});
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

	await presentAlertActions(alert, {
		["➡️📋"]: () => Pasteboard.copy(originalText),
		["📋➡️"]: () => Pasteboard.copy(message),
		[`${convert} 🔄`]: async () => await presentTextInput(CantoneseTransformer),
		[`${settings} ⚙️`]: async () => await settingsMenu(CantoneseTransformer),
		[done]: () => Script.complete(),
	});
}
