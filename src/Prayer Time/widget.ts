import { PrayerTime, Timing } from "Prayer Time/types";
import { convertToLocaleAmPm } from "Prayer Time/utilities";

export function createWidget(timings: Timing[], userTimings: PrayerTime[]) {
	const horizontalSpacing = 6;

	const listWidget = new ListWidget();

	const mainStack = listWidget.addStack();
	mainStack.layoutVertically();
	mainStack.centerAlignContent();

	let rowStack = addRowStack(mainStack, horizontalSpacing);

	timings.forEach((timing, index) => {
		const { prayer, time } = timing;

		const display = userTimings.find((prayerTime) => prayerTime.name.toLowerCase() === prayer.toLowerCase());

		if (display) {
			const timeString = convertToLocaleAmPm(time);

			addTimeStack(rowStack, prayer, display.display, timeString);

			rowStack = addRowStack(mainStack, horizontalSpacing);
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

export function addTimeStack(stack: WidgetStack, text: string, display: string, date: string): WidgetStack {
	const timeStack = stack.addStack();

	timeStack.spacing = 2;
	timeStack.layoutVertically();
	timeStack.centerAlignContent();

	const title = addCenteredTextElementToStack(timeStack, text);
	title.font = new Font("AvenirNext-Bold", 16);

	const icon = addCenteredTextElementToStack(timeStack, display);
	icon.font = new Font("AvenirNext-Regular", 16);

	const time = addCenteredTextElementToStack(timeStack, date);
	time.font = new Font("AvenirNext-Medium", 16);

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
