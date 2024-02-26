import { addStatusToPrayerTimes, getPrayerTimes } from "Prayer Time/data";
import { PrayerTime, UserPrayerTime, Timing } from "Prayer Time/types";
import { convertToLocaleAmPm, dateToString } from "Prayer Time/utilities";
import { WidgetSize } from "../../modules/scriptableTypes";
import { getDaysBetweenDates } from "Prayer Time/date";

export function createWidget(
	dayData: PrayerTime[],
	userPrayerTimes: UserPrayerTime[],
	itemsToShow: number,
	widgetSize: WidgetSize,
	distance: number
) {
	const sortedTimes = getPrayerTimes(dayData, userPrayerTimes, itemsToShow);
	const prayerTimings = addStatusToPrayerTimes(sortedTimes);

	const now = new Date();

	const textColourHex = "#FFFFFF";
	const textOpacitySubtle = 0.8;

	const listWidgetSpacing = 4;
	const timingsRowSpacing = 4;
	const timingsRowItemSpacing = 4;

	const listWidget = new ListWidget();

	if (widgetSize !== "accessoryCircular") {
		listWidget.setPadding(16, 20, 16, 20);
		listWidget.spacing = listWidgetSpacing;
	}

	const timingsStack = listWidget.addStack();
	timingsStack.layoutVertically();
	timingsStack.centerAlignContent();
	timingsStack.spacing = timingsRowSpacing;

	prayerTimings.forEach((prayerTiming) => {
		const { prayer, dateTime } = prayerTiming;

		const opacityScaling = getDaysBetweenDates(now, dateTime) + 1;
		const textOpacity = textOpacitySubtle / opacityScaling;
		const textColour = new Color(textColourHex, textOpacity);

		const userTiming = userPrayerTimes.find((prayerTime) => prayerTime.name.toLowerCase() === prayer.toLowerCase());

		if (!userTiming) return;

		const { name, abbreviation } = userTiming;
		const prayerTitleString = widgetSize === "medium" || widgetSize === "large" ? name.toUpperCase() : abbreviation;

		switch (widgetSize) {
			case "small":
			case "medium":
			case "large":
			case "extraLarge":
				addTimeStackInWidget(timingsStack, prayerTitleString, prayerTiming, timingsRowItemSpacing, textColour);
				break;
			case "accessoryCircular":
				addTimeStackInAccessoryCircular(timingsStack, prayerTitleString, prayerTiming, textColour);
				break;
			case "accessoryInline":
			case "accessoryRectangular":
				addTimeStackInAccessoryInlineRectangle(timingsStack, prayerTitleString, prayerTiming, textColour);
				break;
			default:
				break;
		}
	});

	switch (widgetSize) {
		case "small":
		case "medium":
		case "large":
		case "extraLarge":
			const updatedStack = listWidget.addStack();
			updatedStack.layoutVertically();

			const updatedOn = addCenteredTextElementToStack(updatedStack, `${distance} metres`);
			updatedOn.font = new Font("AvenirNext-Regular", 10);
			updatedOn.textColor = new Color(textColourHex, textOpacitySubtle);

			const updatedAt = addCenteredTextElementToStack(updatedStack, `${dateToString(now)} ${convertToLocaleAmPm(now)}`);
			updatedAt.font = new Font("AvenirNext-Regular", 10);
			updatedAt.textColor = new Color(textColourHex, textOpacitySubtle);
			break;
		default:
			break;
	}

	return listWidget;
}

function addTimeStackInAccessoryInlineRectangle(
	stack: WidgetStack,
	prayerTitleString: string,
	prayerTiming: Timing,
	textColour: Color
): WidgetStack {
	const { dateTime, status } = prayerTiming;

	const fontSizeNext = 14;
	const fontSizeDefault = 12;

	let textFont = new Font("AvenirNext-Regular", fontSizeDefault);

	let _textColour;
	if (status && status.state === "future") _textColour = textColour;

	if (status && status.next) {
		textFont = new Font("AvenirNext-Bold", fontSizeNext);
	}

	const timeStack = stack.addStack();

	const _text = timeStack.addText(prayerTitleString);
	_text.font = textFont;
	_text.lineLimit = 1;

	const _date = timeStack.addDate(dateTime);
	_date.font = textFont;
	_date.lineLimit = 1;
	_date.applyTimeStyle();

	if (_textColour) {
		_text.textColor = _textColour;
		_date.textColor = _textColour;
	}

	return timeStack;
}

function addTimeStackInAccessoryCircular(
	stack: WidgetStack,
	prayerTitleString: string,
	prayerTiming: Timing,
	textColour: Color
): WidgetStack {
	const { dateTime, status } = prayerTiming;

	const fontSizeNext = 14;
	const fontSizeDefault = 12;

	let textFont = new Font("AvenirNext-Regular", fontSizeDefault);

	let _textColour;
	if (status && status.state === "future") _textColour = textColour;

	if (status && status.next) {
		textFont = new Font("AvenirNext-Bold", fontSizeNext);
	}

	const timeStack = stack.addStack();
	timeStack.layoutVertically();

	const textStack = timeStack.addStack();
	textStack.addSpacer();
	const _text = textStack.addText(prayerTitleString);
	_text.font = textFont;
	_text.lineLimit = 1;
	textStack.addSpacer();

	const dateStack = timeStack.addStack();
	dateStack.addSpacer();
	const _date = dateStack.addDate(dateTime);
	_date.font = textFont;
	_date.lineLimit = 1;
	_date.minimumScaleFactor = 0.5;
	_date.applyTimeStyle();
	dateStack.addSpacer();

	if (_textColour) {
		_text.textColor = _textColour;
		_date.textColor = _textColour;
	}

	return timeStack;
}

function addTimeStackInWidget(
	stack: WidgetStack,
	prayerTitleString: string,
	prayerTiming: Timing,
	itemSpacing: number,
	textColour: Color
): WidgetStack {
	const { dateTime, status } = prayerTiming;

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

	const _text = timeStack.addText(prayerTitleString);
	_text.font = textFont;
	_text.lineLimit = 1;

	timeStack.addSpacer();

	const _date = timeStack.addDate(dateTime);
	_date.font = textFont;
	_date.lineLimit = 1;
	_date.applyTimeStyle();

	if (_textColour) {
		_text.textColor = _textColour;
		_date.textColor = _textColour;
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
