import { PrayerTime, RelativeDateTimeState, Timing } from "Prayer Time/types";
import { convertToLocaleAmPm } from "Prayer Time/utilities";

export function createWidget(timings: Timing[], userTimings: PrayerTime[]) {
	const horizontalSpacing = 12;
	const verticalSpacing = 4;

	const listWidget = new ListWidget();

	const mainStack = listWidget.addStack();
	mainStack.layoutVertically();
	mainStack.centerAlignContent();
	mainStack.spacing = verticalSpacing;

	timings.forEach((timing) => {
		let rowStack = addRowStack(mainStack, horizontalSpacing);

		const { prayer, time, status } = timing;

		const userTiming = userTimings.find((prayerTime) => prayerTime.name.toLowerCase() === prayer.toLowerCase());

		if (userTiming) {
			const { display, abbreviation } = userTiming;
			const timeString = convertToLocaleAmPm(time);

			addTimeStack(rowStack, display, abbreviation, timeString, status ? status : "unknown");
		}
	});

	listWidget.presentSmall();
}

export function addRowStack(mainStack: WidgetStack, horizontalSpacing: number): WidgetStack {
	const rowStack = mainStack.addStack();
	rowStack.spacing = horizontalSpacing;
	rowStack.centerAlignContent();
	return rowStack;
}

export function addTimeStack(
	stack: WidgetStack,
	icon: string,
	text: string,
	time: string,
	relativeDateTimeState: RelativeDateTimeState
): WidgetStack {
	const fontSize = 14;

	let textFont = new Font("AvenirNext-Regular", fontSize);
	let textColour;

	if (relativeDateTimeState === "next") textFont = new Font("AvenirNext-Bold", fontSize);
	if (relativeDateTimeState === "future") textColour = new Color("#555555");

	const timeStack = stack.addStack();
	timeStack.spacing = 6;
	timeStack.centerAlignContent();

	const _icon = timeStack.addText(icon);
	_icon.font = textFont;

	const _text = timeStack.addText(text);
	_text.font = textFont;

	const _time = timeStack.addText(time);
	_time.font = textFont;

	if (textColour) {
		_icon.textColor = textColour;
		_text.textColor = textColour;
		_time.textColor = textColour;
	}

	return timeStack;
}

// function addCenteredTextElementToStack(stack: WidgetStack, text: string): WidgetText {
// 	const horizontalStack = stack.addStack();

// 	horizontalStack.addSpacer();

// 	const textElement = horizontalStack.addText(text);
// 	textElement.lineLimit = 1;

// 	horizontalStack.addSpacer();
// 	return textElement;
// }
