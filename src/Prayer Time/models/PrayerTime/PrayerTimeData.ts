import { PrayerTimeAPI } from "src/Prayer Time/models/PrayerTime/PrayerTimeAPI";
import type {
	AladhanPrayerTime,
	WidgetPrayerTiming,
	UserPrayerTime,
	WidgetPreferences,
	RelativeDateTimeState,
} from "src/Prayer Time/types";
import type { DeepPartial } from "src/types/helpers";

export class PrayerTimeData extends PrayerTimeAPI {
	constructor(userPreferences: DeepPartial<WidgetPreferences>) {
		super(userPreferences);
	}

	protected getPrayerTimes(dayData: AladhanPrayerTime[], userPrayerTimes: UserPrayerTime[], itemsToShow?: number): WidgetPrayerTiming[] {
		const now = new Date();

		const displayKeys = userPrayerTimes.map((prayerTime) => {
			return prayerTime.name.toUpperCase();
		});

		let sortedTimes = dayData
			.map((day) => this.convertTimingsToDateArray(day))
			.flat()
			.filter((prayerTime) => displayKeys.includes(prayerTime.prayer.toUpperCase()))
			.filter((prayerTime) => prayerTime.dateTime > now)
			.sort((dateA, dateB) => dateA.dateTime.getTime() - dateB.dateTime.getTime());

		if (itemsToShow) sortedTimes = sortedTimes.slice(0, itemsToShow);

		return sortedTimes;
	}

	private convertTimingsToDateArray(day: AladhanPrayerTime): WidgetPrayerTiming[] {
		const {
			timings,
			date: { gregorian },
		} = day;
		const baseDateStr = gregorian.date; // "DD-MM-YYYY"
		const baseDateComponents = baseDateStr.split("-"); // Split into [DD, MM, YYYY]
		const dateFormatted = `${baseDateComponents[2]}-${baseDateComponents[1]}-${baseDateComponents[0]}`; // YYYY-MM-DD

		return Object.entries(timings).map(([prayerName, prayerTime]) => {
			const timeComponents = prayerTime.split(":"); // Split into [HH, MM]
			const dateTime = new Date(`${dateFormatted}T${timeComponents[0]}:${timeComponents[1]}:00`);
			return { prayer: prayerName, dateTime: dateTime };
		});
	}

	protected getDay(prayerTimes: AladhanPrayerTime[], dayDate?: Date): AladhanPrayerTime | undefined {
		if (!prayerTimes) return undefined;

		const dayArray: AladhanPrayerTime[] = prayerTimes.filter(
			({
				date: {
					gregorian: { date },
				},
			}) => {
				const day = dayDate ? dayDate : new Date();
				day.setHours(0, 0, 0, 0);
				const parsedDate = this.stringToDate(date);
				const isDay = day.toDateString() === parsedDate.toDateString();
				return isDay;
			},
		);

		if (dayArray[0]) {
			const today: AladhanPrayerTime = dayArray[0];
			return today;
		}
	}

	protected addStatusToPrayerTimes(prayerTimings: WidgetPrayerTiming[]): WidgetPrayerTiming[] {
		const now = new Date();
		const todayStart = new Date(new Date(now).setHours(0, 0, 0, 0));
		const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

		const nextPrayerIndex = prayerTimings.findIndex((prayerTime) => prayerTime.dateTime > now);

		return prayerTimings.map((prayerTime, index) => {
			let state: RelativeDateTimeState = "unknown";
			let next = false;

			if (prayerTime.dateTime < now) {
				state = "past";
			} else if (prayerTime.dateTime > now && prayerTime.dateTime <= todayEnd) {
				state = "today";
			} else {
				state = "future";
			}

			if (index === nextPrayerIndex) {
				next = true;
			}

			return {
				prayer: prayerTime.prayer,
				dateTime: prayerTime.dateTime,
				status: { state, next },
			};
		});
	}
}
