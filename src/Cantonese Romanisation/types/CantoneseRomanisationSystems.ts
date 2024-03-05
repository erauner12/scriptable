export type CantoneseRomanisationSystemName =
	| "cantonesePinyin"
	| "cantonRomanization"
	| "ipa"
	| "jyutping"
	| "penkyampDiacritics"
	| "penkyampNumerals"
	| "sidneyLau"
	| "wongDiacritics"
	| "wongNumerals"
	| "yaleDiacritics"
	| "yaleNumerals";

export type CantoneseRomanisationSystems = {
	[key in CantoneseRomanisationSystemName]: string;
};
