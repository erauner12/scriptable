import { H1, Spacer, Table, getTable } from "scriptable-utils";

import { ScriptableFileManager } from "src/utilities";

type State = { toneOfVoice: "friendly" | "off-putting" };

export async function displayApp() {
	const fileSystem = new ScriptableFileManager();
	await fileSystem.createDirectory("store/img/sfsymbols", true);

	present({
		defaultState: { toneOfVoice: "friendly" },
		render: () => [Title(), Spacer(), StateTable()()],
	});
}

const { present, connect } = getTable<State>({
	name: "Prayer Times",
});

function Title() {
	return H1(Script.name(), { icon: "moon_circle" });
}

function StateTable() {
	return connect(({ state: { toneOfVoice } }) =>
		Table({
			columns: { key: { isRowValueBold: true }, val: {} },
			rows: [
				{ cellValues: { key: "Tone of voice", val: toneOfVoice } },
				{
					cellValues: {
						key: "Mood",
						val: toneOfVoice === "friendly" ? "Excited!" : "Disillusioned",
					},
				},
			],
			hideColumnNames: true,
		}),
	);
}
