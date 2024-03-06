import type { CantoJpMin } from "src/Cantonese Romanisation/data/cantoJpMin";
import { CantoneseConverter } from "src/Cantonese Romanisation/models/CantoneseConverter";
import type { CantoneseRomanisationSystemName } from "src/Cantonese Romanisation/types/CantoneseRomanisationSystems";
import type { LocalisationName } from "src/Cantonese Romanisation/types/Localisations";

export class CantoneseTransformer extends CantoneseConverter {
	constructor(
		defaultLanguage: LocalisationName,
		defaultInputRomanisationSystem: CantoneseRomanisationSystemName,
		defaultOutputRomanisationSystem: CantoneseRomanisationSystemName
	) {
		super(
			defaultLanguage,
			defaultInputRomanisationSystem,
			defaultOutputRomanisationSystem
		);
	}

	getWordOfTheDay(date: Date = new Date()): CantoJpMin | undefined {
		const now = new Date(date);
		const utcDate = new Date(
			Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
		);

		const startOfYear = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 0));
		const diff = utcDate.valueOf() - startOfYear.valueOf();
		const oneDay = 1000 * 60 * 60 * 24;
		const dayOfYear = Math.floor(diff / oneDay);

		const keys = Object.keys(this.cantoJpMin);
		const objectLength = keys.length;

		const index = dayOfYear % objectLength;

		const key = keys[index];
		if (!key) return undefined;

		const jyutpingArray = this.cantoJpMin[key];
		if (!jyutpingArray) return undefined;

		const romanisedArray = jyutpingArray.map((jyutping) => {
			if (this.inputRomanisationSystem !== this.outputRomanisationSystem) {
				return this.transformRomanisationSystem(jyutping, "jyutping");
			}
			return jyutping;
		});

		return { [key]: romanisedArray };
	}
}
