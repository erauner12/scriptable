import type { CantoneseRomanisationSystemName } from "src/Cantonese Romanisation/types/CantoneseRomanisationSystems";
import type { LocalisationName } from "src/Cantonese Romanisation/types/Localisations";

export type Settings = {
	language: LocalisationName;
	inputRomanisationSystem: CantoneseRomanisationSystemName;
	outputRomanisationSystem: CantoneseRomanisationSystemName;
};
