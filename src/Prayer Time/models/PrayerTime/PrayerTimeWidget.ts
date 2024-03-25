import { PrayerTimeData } from "src/Prayer Time/models/PrayerTime/PrayerTimeData";
import type { AladhanPrayerTime, WidgetPrayerTiming, WidgetPreferences } from "src/Prayer Time/types";
import type { DeepPartial } from "src/types/helpers";

export class PrayerTimeWidget extends PrayerTimeData {
	constructor(userPreferences: DeepPartial<WidgetPreferences>) {
		super(userPreferences);
	}

	protected createWidget(dayData: AladhanPrayerTime[], distance: number): ListWidget {
		const sortedTimes = this.getFilteredPrayerTimes(dayData, this.displayItems);
		const prayerTimings = this.addStatusToPrayerTimes(sortedTimes);

		const now = new Date();

		const textColourHex = "#FFFFFF";
		const textOpacitySubtle = 0.8;

		const listWidgetSpacing = 4;
		const timingsRowSpacing = 4;
		const timingsRowItemSpacing = 4;

		const listWidget = new ListWidget();

		if (this.widgetSize !== "accessoryCircular") {
			listWidget.setPadding(16, 20, 16, 20);
			listWidget.spacing = listWidgetSpacing;
		}

		const timingsStack = listWidget.addStack();
		timingsStack.layoutVertically();
		timingsStack.centerAlignContent();
		timingsStack.spacing = timingsRowSpacing;

		prayerTimings.forEach((prayerTiming) => {
			const { prayer, dateTime } = prayerTiming;

			const opacityScaling = this.getDaysBetweenDates(now, dateTime) + 1;
			const textOpacity = textOpacitySubtle / opacityScaling;
			const textColour = new Color(textColourHex, textOpacity);

			const userTiming = this.preferences.user.displayPrayerTimes.find(
				(prayerTime) => prayerTime.name.toLowerCase() === prayer.toLowerCase(),
			);

			if (!userTiming) return;

			const { name, abbreviation } = userTiming;
			const prayerTitleString = this.widgetSize === "medium" || this.widgetSize === "large" ? name.toUpperCase() : abbreviation;

			switch (this.widgetSize) {
				case "small":
				case "medium":
				case "large":
				case "extraLarge":
					this.addTimeStackInWidget(timingsStack, prayerTitleString, prayerTiming, timingsRowItemSpacing, textColour);
					break;
				case "accessoryCircular":
					this.addTimeStackInAccessoryCircular(timingsStack, prayerTitleString, prayerTiming, textColour);
					break;
				case "accessoryInline":
				case "accessoryRectangular":
					this.addTimeStackInAccessoryInlineRectangle(timingsStack, prayerTitleString, prayerTiming, textColour);
					break;
				default:
					break;
			}
		});

		switch (this.widgetSize) {
			case "small":
			case "medium":
			case "large":
			case "extraLarge":
				const updatedStack = listWidget.addStack();
				updatedStack.layoutVertically();

				const distanceFromUpdate = this.addCenteredTextElementToStack(updatedStack, `${distance} metres`);
				distanceFromUpdate.font = new Font("AvenirNext-Regular", 10);
				distanceFromUpdate.textColor = new Color(textColourHex, textOpacitySubtle);

				const [dateElement, timeElement] = this.addCenteredDateElementToStack(updatedStack, now);
				dateElement.font = new Font("AvenirNext-Regular", 10);
				dateElement.textColor = new Color(textColourHex, textOpacitySubtle);
				timeElement.font = new Font("AvenirNext-Regular", 10);
				timeElement.textColor = new Color(textColourHex, textOpacitySubtle);
				break;
			default:
				break;
		}

		return listWidget;
	}

	private addTimeStackInAccessoryInlineRectangle(
		stack: WidgetStack,
		prayerTitleString: string,
		prayerTiming: WidgetPrayerTiming,
		textColour: Color,
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

	private addTimeStackInAccessoryCircular(
		stack: WidgetStack,
		prayerTitleString: string,
		prayerTiming: WidgetPrayerTiming,
		textColour: Color,
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

	private addTimeStackInWidget(
		stack: WidgetStack,
		prayerTitleString: string,
		prayerTiming: WidgetPrayerTiming,
		itemSpacing: number,
		textColour: Color,
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

	private addCenteredTextElementToStack(stack: WidgetStack, text: string): WidgetText {
		const horizontalStack = stack.addStack();

		horizontalStack.addSpacer();

		const element = horizontalStack.addText(text);
		element.lineLimit = 1;
		element.centerAlignText();

		horizontalStack.addSpacer();
		return element;
	}

	private addCenteredDateElementToStack(stack: WidgetStack, date: Date): [WidgetDate, WidgetDate] {
		const horizontalStack = stack.addStack();

		horizontalStack.addSpacer();

		const dateElement = horizontalStack.addDate(date);
		dateElement.applyDateStyle();
		dateElement.lineLimit = 1;
		dateElement.centerAlignText();

		horizontalStack.spacing = 2;

		const timeElement = horizontalStack.addDate(date);
		timeElement.applyTimeStyle();
		timeElement.lineLimit = 1;
		timeElement.centerAlignText();

		horizontalStack.addSpacer();
		return [dateElement, timeElement];
	}
}
