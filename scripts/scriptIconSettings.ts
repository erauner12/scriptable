type IconColor =
	| "blue"
	| "deep-blue"
	| "red"
	| "gray"
	| "light-gray"
	| "deep-gray"
	| "yellow"
	| "cyan"
	| "green"
	| "deep-green"
	| "purple"
	| "deep-purple"
	| "pink";

type NonEmptyArray<T> = [T, ...T[]];
type ShareSheetInput = "file-url" | "url" | "image" | "plain-text";

export type ScriptSettings = {
	iconColor: IconColor;
	iconGlyph: string;
	alwaysRunInApp?: boolean;
	shareSheetInputs?: NonEmptyArray<ShareSheetInput>;
};

type SettingsGroup = Record<string, ScriptSettings>;

export const SETTINGS: SettingsGroup = {
	"Redirect Me": {
		iconColor: "deep-purple",
		iconGlyph: "reply-all",
		shareSheetInputs: ["url"],
	},
	"Prayer Time": {
		iconColor: "deep-green",
		iconGlyph: "mosque",
	},
};
