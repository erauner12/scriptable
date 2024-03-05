import { type CantoneseRomanisationSystems } from "src/Cantonese Romanisation/types/CantoneseRomanisationSystems";

export type LocalisationName = "en" | "zhs" | "zht";

export type Localisations = {
	[key in LocalisationName]: Localisation;
};

export type Localisation = {
	cancel: string
	convert: string;
	done: string;
	input: string;
	inputRomanisationSystem: string;
	language: string;
	languageName: string;
	outputRomanisationSystem: string;
	result: string;
	romanisationSystems: CantoneseRomanisationSystems;
	settings: string;
	source: string;
	submit: string,
	title: string;
};
