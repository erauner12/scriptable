export type PresentAlertActions = {
	[title: string]: () => Promise<void> | void;
};

export async function presentAlertActions(
	alert: Alert,
	actions: PresentAlertActions
) {
	Object.keys(actions).forEach((title) => alert.addAction(title));

	const selectionIndex = await alert.presentAlert();
	const actionTitles = Object.keys(actions);
	const selectedActionKey = actionTitles[selectionIndex];

	if (selectedActionKey) {
		const action = actions[selectedActionKey];
		if (action) await action();
	}
}
