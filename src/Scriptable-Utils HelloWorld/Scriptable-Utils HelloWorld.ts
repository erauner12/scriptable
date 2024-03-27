import { Button, Div, getTable, H1, P, Spacer, Table } from "scriptable-utils";
import { ScriptableFileManager } from "src/utilities/scriptable/models/ScriptableFileManager";

type State = { toneOfVoice: "friendly" | "off-putting" };

const { present, connect, setState } = getTable<State>({
	name: "Example table",
});

const Title = connect(({ state: { toneOfVoice } }) => H1(toneOfVoice === "friendly" ? "Hello world!" : "What do you want"));

const ToggleToneOfVoice = connect(({ state: { toneOfVoice } }) =>
	Button({
		text: toneOfVoice === "friendly" ? "Try another tone of voice!" : "Ugh, fine, click me",
		icon: "cycle",
		flavor: "primary",
		onTap: () =>
			setState({
				toneOfVoice: toneOfVoice === "friendly" ? "off-putting" : "friendly",
			}),
	}),
);

const LoremIpsum = connect(({ state: { toneOfVoice } }) =>
	Div(
		[
			P(
				toneOfVoice === "friendly"
					? "Well hello there! Thanks for stopping by, this is my table, would you like to take a seat?"
					: "Everyone always clicks me. I don't like it. Would you like it if I walked up to you and clicked you?",
			),
		],
		{ height: 100 },
	),
);

const StateTable = connect(({ state: { toneOfVoice } }) =>
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

(async () => {
	const fileSystem = new ScriptableFileManager();
	await fileSystem.createDirectory("store/img/sfsymbols", true);

	present({
		defaultState: { toneOfVoice: "friendly" },
		render: () => [Title(), ToggleToneOfVoice(), Spacer(), StateTable(), LoremIpsum()],
	});
})();
