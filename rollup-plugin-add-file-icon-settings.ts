import { Plugin } from "rollup";
import { ScriptSettings, SETTINGS } from "./scriptIconSettings";

const COMMENT_ATOMS = {
	line1: "Variables used by Scriptable.",
	line2: "These must be at the very top of the file. Do not edit.",
	runInApp: "always-run-in-app: true;",
};

const fallbackIconSettings: ScriptSettings = {
	iconColor: "yellow",
	iconGlyph: "exclamation-triangle",
	alwaysRunInApp: false,
};

const addFileIconSettings = (filePath: string): Plugin => ({
	name: "rollup-plugin-scriptable-icon-settings",
	renderChunk: (code) => {
		const commentLines = getBannerForFilePath(filePath);
		return commentLines ? [commentLines, code].join("\n") : code;
	},
});

function getBannerForFilePath(filePath: string) {
	const matchForTsFiles = filePath.match(/.*\/([a-z0-9\. ]+)\.ts/i);
	if (!matchForTsFiles?.[1]) return null;
	const filename = matchForTsFiles[1];

	const settingsForFile = SETTINGS[filename];
	if (settingsForFile) {
		return getScriptableSettingsCommentLines(settingsForFile);
	}
	const DIVIDER = "-".repeat(50);
	// eslint-disable-next-line no-console
	console.log(
		["", DIVIDER, `Missing settings for ${filename}!`, DIVIDER, ""].join("\n")
	);
	return getScriptableSettingsCommentLines(fallbackIconSettings);
}

function getScriptableSettingsCommentLines({
	iconColor,
	iconGlyph,
	alwaysRunInApp,
	shareSheetInputs,
}: ScriptSettings) {
	const colorAtom = `icon-color: ${iconColor};`;
	const iconAtom = `icon-glyph: ${iconGlyph};`;
	const shareSheetInputAtom = shareSheetInputs
		? `share-sheet-inputs: ${shareSheetInputs.join(", ")};`
		: null;

	let line3;
	let line4;

	if (alwaysRunInApp && !shareSheetInputAtom) {
		line3 = [COMMENT_ATOMS.runInApp, colorAtom];
		line4 = [iconAtom];
	} else if (!alwaysRunInApp && shareSheetInputAtom) {
		line3 = [colorAtom, iconAtom];
		line4 = [shareSheetInputAtom];
	} else if (alwaysRunInApp && shareSheetInputAtom) {
		line3 = [COMMENT_ATOMS.runInApp, colorAtom];
		line4 = [iconAtom, shareSheetInputAtom];
	} else {
		line3 = [colorAtom, iconAtom];
		line4 = null;
	}

	const commentLines = [
		COMMENT_ATOMS.line1,
		COMMENT_ATOMS.line2,
		line3.join(" "),
	];

	if (line4) {
		commentLines.push(line4.join(" "));
	}

	return commentLines
		.filter(Boolean)
		.map((text) => `// ${text}`)
		.join("\n");
}

export default addFileIconSettings;
