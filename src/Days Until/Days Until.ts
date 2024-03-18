widget();

function widget() {
	const widget = new ListWidget();
	widget.spacing = 4;
	widget.setPadding(10, 10, 10, 10);

	const errors: string[] = [];

	const parameters = args.widgetParameter;

	if (!parameters || typeof parameters !== "string") {
		addError(
			widget,
			errors,
			'No arguments provided.\n\nArguments should be configured on the home screen using a comma separated:\n\ntitle, date\n("YYYY-MM-DD hh:mm")',
			presentErrors,
		);
		return;
	}

	console.log(parameters);

	const [title, dateString] = parameters.split(",").map((parameter: string) => parameter.trim());
	if (!title || !dateString) {
		if (!title) {
			addError(widget, errors, "Could not parse title.");
		}

		if (!dateString) {
			addError(widget, errors, 'Could not parse date.\n\nDate should be formatted as "YYYY-MM-DD hh:mm".');
		}

		presentErrors(widget, errors);
		return;
	}

	const date = new Date(dateString);
	if (isNaN(date.getTime())) {
		addError(widget, errors, 'Invalid date format.\n\nEnsure the date is formatted as "YYYY-MM-DD hh:mm".', presentErrors);
		return;
	}

	displayWidget(widget, title, date);
}

function displayWidget(widget: ListWidget, title: string, date: Date) {
	const widgetText = widget.addText(title);
	widgetText.centerAlignText();

	const widgetCountdown = widget.addDate(date);
	widgetCountdown.applyRelativeStyle();
	widgetCountdown.centerAlignText();
	widgetCountdown.font = Font.boldSystemFont(14);

	const dateTimeStack = widget.addStack();
	dateTimeStack.layoutVertically();
	dateTimeStack.spacing = 2;

	const dateStack = dateTimeStack.addStack();

	dateStack.addSpacer();

	const dayStack = dateStack.addStack();
	dayStack.spacing = 2;

	const widgetDay = dayStack.addText(date.toLocaleDateString(undefined, { weekday: "long" }));
	widgetDay.font = Font.systemFont(10);
	widgetDay.textColor = Color.gray();

	const widgetDate = dayStack.addDate(date);
	widgetDate.applyDateStyle();
	widgetDate.font = Font.systemFont(10);
	widgetDate.textColor = Color.gray();

	dateStack.addSpacer();

	const timeStack = dateTimeStack.addStack();

	timeStack.addSpacer();

	const widgetTime = timeStack.addDate(date);
	widgetTime.applyTimeStyle();
	widgetTime.font = Font.systemFont(10);
	widgetTime.textColor = Color.gray();

	timeStack.addSpacer();

	widget.presentSmall();
	Script.complete();
}

function addError(widget: ListWidget, errors: string[], message: string, onError?: (widget: ListWidget, errors: string[]) => void) {
	errors.push(message);
	if (onError) onError(widget, errors);
}

function presentErrors(widget: ListWidget, errors: string[]) {
	errors.forEach((error) => {
		const widgetText = widget.addText(error);
		widgetText.centerAlignText();
		widgetText.font = Font.systemFont(14);
		widgetText.textColor = Color.red();
	});
	widget.presentLarge();
	Script.complete();
}
