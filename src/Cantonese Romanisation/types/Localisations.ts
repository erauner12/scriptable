import { type CantoneseRomanisationSystems } from "src/Cantonese Romanisation/types/CantoneseRomanisationSystems";

export const LocalisationName = ["en", "zhs", "zht"] as const;
export type LocalisationName = (typeof LocalisationName)[number];

export function isLocalisationName(value: LocalisationName): value is LocalisationName {
	return LocalisationName.includes(value);
}

export type Localisations = {
	[key in LocalisationName]: Localisation;
};

export type Localisation = {
	cancel: string;
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
	submit: string;
	title: string;
};
