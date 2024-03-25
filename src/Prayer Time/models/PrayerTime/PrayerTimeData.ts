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

	protected calculateDistanceFromLocation(prayerTime: AladhanPrayerTime | undefined): number {
		if (prayerTime && this.preferences.data.location) {
			return this.calculateDistance(this.preferences.data.location, prayerTime.meta);
		}

		return this.preferences.user.distanceToleranceMetres;
	}

	protected getPrayerTimeForDay(prayerTimes: AladhanPrayerTime[], targetDate: Date = new Date()): AladhanPrayerTime | undefined {
		if (!prayerTimes) return undefined;

		const filteredPrayerTimes: AladhanPrayerTime[] = prayerTimes.filter((prayerTime) => {
			const day = targetDate ? targetDate : new Date();
			day.setHours(0, 0, 0, 0);
			const parsedDate = this.parseDateString(prayerTime.date.gregorian.date);
			const isTargetDay = day.toDateString() === parsedDate.toDateString();
			return isTargetDay;
		});

		if (filteredPrayerTimes[0]) {
			const prayerTimesForDay: AladhanPrayerTime = filteredPrayerTimes[0];
			return prayerTimesForDay;
		}
	}

	protected getFilteredPrayerTimes(prayerTimes: AladhanPrayerTime[], maxItems?: number): WidgetPrayerTiming[] {
		const currentTime = new Date();
		const userPrayerTimes: UserPrayerTime[] = this.preferences.user.displayPrayerTimes;

		const prayerNames = userPrayerTimes.map((prayerTime) => {
			return prayerTime.name.toUpperCase();
		});

		let filteredTimes = prayerTimes
			.map((day) => this.convertPrayerTimingsToDateArray(day))
			.flat()
			.filter((prayerTime) => prayerNames.includes(prayerTime.prayer.toUpperCase()))
			.filter((prayerTime) => prayerTime.dateTime > currentTime)
			.sort((timeA, timeB) => timeA.dateTime.getTime() - timeB.dateTime.getTime());

		if (maxItems) filteredTimes = filteredTimes.slice(0, maxItems);

		return filteredTimes;
	}

	private convertPrayerTimingsToDateArray(prayerTime: AladhanPrayerTime): WidgetPrayerTiming[] {
		const baseDateString = prayerTime.date.gregorian.date; // "DD-MM-YYYY"
		const baseDateComponents = baseDateString.split("-"); // Split into [DD, MM, YYYY]
		const dateFormatted = `${baseDateComponents[2]}-${baseDateComponents[1]}-${baseDateComponents[0]}`; // YYYY-MM-DD

		return Object.entries(prayerTime.timings).map(([prayerName, prayerTime]) => {
			const timeComponents = prayerTime.split(":"); // Split into [HH, MM]
			const dateTime = new Date(`${dateFormatted}T${timeComponents[0]}:${timeComponents[1]}:00`);
			return { prayer: prayerName, dateTime: dateTime };
		});
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
