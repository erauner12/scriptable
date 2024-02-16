import { addStatusToPrayerTimes, getPrayerTimes } from "Prayer Time/data";
import { APIData, PrayerTime, Timing } from "Prayer Time/types";
import { convertToLocaleAmPm, dateToString } from "Prayer Time/utilities";
import { WidgetSize } from "../../modules/scriptableTypes";
import { getDaysBetweenDates } from "Prayer Time/date";

export function createWidget(
	dayData: APIData[],
	userPrayerTimes: PrayerTime[],
	itemsToShow: number,
	widgetSize: WidgetSize,
	distance: number
) {
	const sortedTimes = getPrayerTimes(dayData, userPrayerTimes, itemsToShow);
	const prayerTimings = addStatusToPrayerTimes(sortedTimes);

	const now = new Date();

	const textColour = "#FFFFFF";
	const textOpacitySubtle = 0.8;

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

	prayerTimings.forEach((prayerTiming) => {
		const { prayer, dateTime } = prayerTiming;

		const opacityScaling = getDaysBetweenDates(now, dateTime) + 1;
		const textOpacity = textOpacitySubtle / opacityScaling;
		const _textColour = new Color(textColour, textOpacity);

		const userTiming = userPrayerTimes.find((prayerTime) => prayerTime.name.toLowerCase() === prayer.toLowerCase());

		if (userTiming) {
			const { name, abbreviation } = userTiming;
			const prayerTitleString = widgetSize === "medium" || widgetSize === "large" ? name.toUpperCase() : abbreviation;

			addTimeStack(timingsStack, prayerTitleString, prayerTiming, timingsRowItemSpacing, widgetSize, _textColour);
		}
	});

	const updatedStack = listWidget.addStack();
	updatedStack.layoutVertically();

	const updatedOn = addCenteredTextElementToStack(updatedStack, `${distance} metres`);
	updatedOn.font = new Font("AvenirNext-Regular", 10);
	updatedOn.textColor = new Color(textColour, textOpacitySubtle);

	const updatedAt = addCenteredTextElementToStack(updatedStack, `${dateToString(now)} ${convertToLocaleAmPm(now)}`);
	updatedAt.font = new Font("AvenirNext-Regular", 10);
	updatedAt.textColor = new Color(textColour, textOpacitySubtle);

	return listWidget;
}

export function addRowStack(mainStack: WidgetStack, horizontalSpacing: number): WidgetStack {
	const rowStack = mainStack.addStack();
	rowStack.spacing = horizontalSpacing;
	rowStack.centerAlignContent();
	return rowStack;
}

export function addTimeStack(
	stack: WidgetStack,
	prayerTitleString: string,
	prayerTiming: Timing,
	itemSpacing: number,
	widgetSize: WidgetSize,
	textColour: Color
): WidgetStack {
	const { dateTime, status } = prayerTiming;

	const timeString = convertToLocaleAmPm(dateTime);

	const fontSizeNext = 14;
	const fontSizeDefault = 12;

	let textFont = new Font("AvenirNext-Regular", fontSizeDefault);

	let _textColour;
	if (status && status.state === "future") _textColour = textColour;

	if (status && status.next) {
		textFont = new Font("AvenirNext-Bold", fontSizeNext);
	}

	const timeStack = stack.addStack();
	timeStack.spacing = itemSpacing;
	timeStack.centerAlignContent();

	const _text = timeStack.addText(prayerTitleString);
	_text.font = textFont;
	_text.lineLimit = 1;

	timeStack.addSpacer(undefined);

	let dateTimeString = timeString;

	const _time = timeStack.addText(dateTimeString);
	_time.font = textFont;
	_time.lineLimit = 1;

	if (_textColour) {
		_text.textColor = _textColour;
		_time.textColor = _textColour;
	}

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
