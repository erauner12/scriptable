import { type CantoneseRomanisationSystems } from "src/Cantonese Romanisation/types/CantoneseRomanisationSystems";

export type LocalisationName = "en" | "zhs" | "zht";

export type Localisations = {
	[key in LocalisationName]: Localisation;
};

export type Localisation = {
	convert: string;
	inputRomanisationSystem: string;
	outputRomanisationSystem: string;
	input: string;
	language: string;
	languageName: string;
	result: string;
	romanisationSystems: CantoneseRomanisationSystems;
	settings: string;
	source: string;
	title: string;
};
