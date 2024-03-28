import { storybook } from "scriptable-utils";

import { ScriptableFileManager } from "src/utilities";

(async () => {
	const fileSystem = new ScriptableFileManager();
	await fileSystem.createDirectory("store/img/sfsymbols", true);

	await storybook();
})();
