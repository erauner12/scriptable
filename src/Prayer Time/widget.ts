import { PrayerTime, Timing } from "Prayer Time/types";
import { convertToLocaleAmPm, dateToString } from "Prayer Time/utilities";

export function createWidget(timings: Timing[], userTimings: PrayerTime[], distance: number) {
	const now = new Date();

	const subtleColour = new Color("#888888");

	const listWidgetSpacing = 4;
	const timingsRowSpacing = 4;
	const timingsRowItemSpacing = 4;

	const listWidget = new ListWidget();
	listWidget.setPadding(16, 20, 16, 20);
	listWidget.spacing = listWidgetSpacing;

	const timingsStack = listWidget.addStack();
	timingsStack.layoutVertically();
	timingsStack.centerAlignContent();

	timingsStack.spacing = timingsRowSpacing;

	timings.forEach((timing) => {
		const { prayer, time, status } = timing;

		const userTiming = userTimings.find((prayerTime) => prayerTime.name.toLowerCase() === prayer.toLowerCase());

		if (userTiming) {
			const { abbreviation } = userTiming;
			const timeString = convertToLocaleAmPm(time);

			addTimeStack(timingsStack, abbreviation, timeString, status, timingsRowItemSpacing);
		}
	});

	const updatedStack = listWidget.addStack();
	updatedStack.layoutVertically();

	const updatedOn = addCenteredTextElementToStack(updatedStack, `${distance} metres`);
	updatedOn.font = new Font("AvenirNext-Regular", 10);
	updatedOn.textColor = subtleColour;

	const updatedAt = addCenteredTextElementToStack(updatedStack, `${dateToString(now)} ${convertToLocaleAmPm(now)}`);
	updatedAt.font = new Font("AvenirNext-Regular", 10);
	updatedAt.textColor = subtleColour;

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
	text: string,
	time: string,
	relativeDateTimeState: Timing["status"],
	itemSpacing: number
): WidgetStack {
	const fontSizeNext = 14;
	const fontSizeDefault = 12;

	let textFont = new Font("AvenirNext-Regular", fontSizeDefault);

	let textColour;
	if (relativeDateTimeState.state === "future") textColour = new Color("#888888");

	if (relativeDateTimeState.next) {
		textFont = new Font("AvenirNext-Bold", fontSizeNext);
	}

	const timeStack = stack.addStack();
	timeStack.spacing = itemSpacing;
	timeStack.centerAlignContent();

	const _text = timeStack.addText(text);
	_text.font = textFont;
	_text.lineLimit = 1;

	timeStack.addSpacer(undefined);

	const _time = timeStack.addText(time);
	_time.font = textFont;
	_time.lineLimit = 1;

	if (textColour) {
		_text.textColor = textColour;
		_time.textColor = textColour;
	}

	// timeStack.addSpacer(undefined);

	return timeStack;
}

function addCenteredTextElementToStack(stack: WidgetStack, text: string): WidgetText {
	const horizontalStack = stack.addStack();

	horizontalStack.addSpacer();

	const textElement = horizontalStack.addText(text);
	textElement.lineLimit = 1;

	horizontalStack.addSpacer();
	return textElement;
}
