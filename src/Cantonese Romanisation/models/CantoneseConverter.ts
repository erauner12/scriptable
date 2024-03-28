import { type CantoJpMin, cantoJpMin } from "src/Cantonese Romanisation/data/cantoJpMin";
import { localisations } from "src/Cantonese Romanisation/data/localisations";
import { type Pingyam, pingyam } from "src/Cantonese Romanisation/data/pingyam";
import { type CantoneseRomanisationSystemName } from "src/Cantonese Romanisation/types/CantoneseRomanisationSystems";
import { type Localisation, type LocalisationName, type Localisations } from "src/Cantonese Romanisation/types/Localisations";

export class CantoneseConverter {
	protected cantoJpMin: CantoJpMin;
	protected pingyam: Pingyam;
	protected localisations: Localisations;
	protected localisation: Localisation;
	protected inputRomanisationSystem: CantoneseRomanisationSystemName;
	protected outputRomanisationSystem: CantoneseRomanisationSystemName;

	constructor(
		defaultLanguage: LocalisationName,
		defaultInputRomanisationSystem: CantoneseRomanisationSystemName,
		defaultOutputRomanisationSystem: CantoneseRomanisationSystemName,
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

	public convertToRomanisation(text: string) {
		const jyutping = this.toJyutping(text);
		if (this.inputRomanisationSystem !== this.outputRomanisationSystem) {
			return this.transformRomanisationSystem(jyutping);
		}
		return jyutping;
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
	protected toJyutpingString(chineseCharacterString: string): string {
		const jyutpingRomanisations = this.toJyutpingRomanisations(chineseCharacterString);
		return jyutpingRomanisations
			.map((romanisation, index, array) => {
				// If jyutping is undefined or an empty array, return the original character
				if (!romanisation.jyutping || romanisation.jyutping.length === 0) {
					return romanisation.original;
				}

				const jyutpingValue = romanisation.jyutping[0];

				// Check if the next item exists and if it has a defined and non-empty jyutping
				const nextItem = array[index + 1];
				const shouldAddSpace = nextItem && nextItem.jyutping && nextItem.jyutping.length > 0;

				// Add a space only if there is a valid next item with a non-empty jyutping
				return shouldAddSpace ? `${jyutpingValue} ` : jyutpingValue;
			})
			.join("")
			.trim(); // Join all parts together and trim any trailing space
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
	protected toJyutpingRomanisations(chineseCharacterString: string): {
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

	protected transformRomanisationSystem(
		text: string,
		inputRomanisationSystem: CantoneseRomanisationSystemName = this.inputRomanisationSystem,
		outputRomanisationSystem: CantoneseRomanisationSystemName = this.outputRomanisationSystem,
	): string {
		const transformationMapping = Object.entries(this.pingyam).reduce<Record<string, string>>((accumulator, [, value]) => {
			const source = value[inputRomanisationSystem].toLowerCase();
			const target = value[outputRomanisationSystem];
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
