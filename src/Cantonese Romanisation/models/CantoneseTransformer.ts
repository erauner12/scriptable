import { CantoJpMin, cantoJpMin } from "Cantonese Romanisation/data/cantoJpMin";
import { localisations } from "Cantonese Romanisation/data/localisations";
import { Pingyam, pingyam } from "Cantonese Romanisation/data/pingyam";
import { type CantoneseRomanisationSystemName } from "Cantonese Romanisation/types/CantoneseRomanisationSystems";
import {
	type Localisations,
	type Localisation,
	type LocalisationName,
} from "Cantonese Romanisation/types/Localisations";

export class CantoneseTransformer {
	private cantoJpMin: CantoJpMin;
	private pingyam: Pingyam;
	private localisations: Localisations;
	private localisation: Localisation;
	private inputRomanisationSystem: CantoneseRomanisationSystemName;
	private outputRomanisationSystem: CantoneseRomanisationSystemName;

	constructor(
		defaultLanguage: LocalisationName,
		defaultInputRomanisationSystem: CantoneseRomanisationSystemName,
		defaultOutputRomanisationSystem: CantoneseRomanisationSystemName
	) {
		this.cantoJpMin = cantoJpMin;
		this.pingyam = pingyam;
		this.localisations = localisations;
		this.localisation = this.localisations[defaultLanguage];
		this.inputRomanisationSystem = defaultInputRomanisationSystem;
		this.outputRomanisationSystem = defaultOutputRomanisationSystem;
	}

	public setLocalisation(language: LocalisationName) {
		this.localisation = this.localisations[language];
	}

	public getLocalisation() {
		return this.localisation;
	}

	public getLocalisations() {
		return this.localisations;
	}

	public getInputRomanisationSystem() {
		return this.inputRomanisationSystem;
	}

	public setInputRomanisationSystem(system: CantoneseRomanisationSystemName) {
		this.inputRomanisationSystem = system;
	}

	public getOutputRomanisationSystem() {
		return this.outputRomanisationSystem;
	}

	public setOutputRomanisationSystem(system: CantoneseRomanisationSystemName) {
		this.outputRomanisationSystem = system;
	}

	/**
	 * Converts Chinese characters to jyutping romanisation.
	 * @param text string
	 * @returns string
	 */
	public toJyutping(text: string): string {
		return this.toJyutpingString(text);
	}

	/**
	 * Converts a Chinese character string into a Jyutping string using the first available Jyutping conversion.
	 *
	 * *Note: There's no guarantee that the first Jyutping option is correct within the given sentence.*
	 *
	 * @param {string} chineseCharacterString
	 * @returns {string} jyutpingString
	 *
	 * @example
	 * // returns "sik6 zo2 faan6 mei6 aa1 ? 🍚"
	 * CantoneseRomanisation.toJyutpingString("食咗飯未呀 ? 🍚")
	 */
	private toJyutpingString(chineseCharacterString: string): string {
		const jyutpingRomanisations = this.toJyutpingRomanisations(
			chineseCharacterString
		);
		return jyutpingRomanisations
			.map((romanisation) => {
				if (romanisation.jyutping) return romanisation.jyutping[0]; // Get the first Jyutping option
				return romanisation.original; // Return the original character (usually punctuation or emoji)
			})
			.join(" ");
	}

	/**
	 * Convert a Chinese character string into an array of each character and its Jyutping options.
	 *
	 * @param {string} chineseCharacterString
	 * @returns {array} romanisationArray
	 *
	 * @example
	 * // returns [{"original":"食","jyutping":["sik6","sik2","zi6","ji6"]},{"original":"咗","jyutping":["zo2"]},{"original":"飯","jyutping":["faan6","faan2"]},{"original":"未","jyutping":["mei6"]},{"original":"呀","jyutping":["aa1","ngaa1","aa3","ngaa3"]},{"original":" "},{"original":"?"},{"original":" "},{"original":"\ud83c"},{"original":"\udf5a"}]
	 * CantoneseRomanisation.toJyutpingRomanisations("食咗飯未呀 ? 🍚")
	 */
	private toJyutpingRomanisations(chineseCharacterString: string): {
		original: string;
		jyutping?: string[];
	}[] {
		const charactersArray = Array.from(chineseCharacterString); // This ensures that emojis are kept as a single item in the array

		return charactersArray.map((character) => {
			const jyutping = this.cantoJpMin[character]; // Lookup jyutping data

			if (jyutping) {
				return { original: character, jyutping: jyutping };
			}

			return { original: character, jyutping: undefined };
		});
	}

	public transformRomanisationSystem(
		text: string,
		inputRomanisationSystem?: CantoneseRomanisationSystemName,
		outputRomanisationSystem?: CantoneseRomanisationSystemName
	): string {
		const inputSystem = inputRomanisationSystem || this.inputRomanisationSystem;
		const outputSystem =
			outputRomanisationSystem || this.outputRomanisationSystem;

		const transformationMapping = Object.entries(this.pingyam).reduce<
			Record<string, string>
		>((accumulator, [_, value]) => {
			const source = value[inputSystem].toLowerCase();
			const target = value[outputSystem];
			if (source && target) accumulator[source] = target;
			return accumulator;
		}, {});

		return text
			.split(/\b/) // Split at word boundary
			.map((word) => {
				const lowerCaseWord = word.toLowerCase();

				// Checks if the string word contains any word character
				if (/\w/.test(word)) {
					return transformationMapping[lowerCaseWord] || "🤷🏻";
				}

				return word;
			})
			.join("");
	}
}
