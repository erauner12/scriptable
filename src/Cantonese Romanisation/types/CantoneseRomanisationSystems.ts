export type CantoneseRomanisationSystems = {
	[key in CantoneseRomanisationSystemName]: string;
};

export const CantoneseRomanisationSystemNames = [
	"cantonesePinyin",
	"cantonRomanization",
	"ipa",
	"jyutping",
	"penkyampDiacritics",
	"penkyampNumerals",
	"sidneyLau",
	"wongDiacritics",
	"wongNumerals",
	"yaleDiacritics",
	"yaleNumerals",
] as const;

export type CantoneseRomanisationSystemName =
	(typeof CantoneseRomanisationSystemNames)[number];

export function getRomanisationSystemNameByIndex(
	index: number
): CantoneseRomanisationSystemName | undefined {
	if (index >= 0 && index < CantoneseRomanisationSystemNames.length) {
		const cantoneseRomanisationSystemName:
			| CantoneseRomanisationSystemName
			| undefined = CantoneseRomanisationSystemNames[index];
		if (cantoneseRomanisationSystemName) return cantoneseRomanisationSystemName;
		return undefined;
	} else {
		return undefined;
	}
}
