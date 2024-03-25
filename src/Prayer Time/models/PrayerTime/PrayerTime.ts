import { PrayerTimeWidget } from "src/Prayer Time/models/PrayerTime/PrayerTimeWidget";
import type { AladhanPrayerTime, WidgetPreferences } from "src/Prayer Time/types";
import type { DeepPartial } from "src/types/helpers";

export class PrayerTime extends PrayerTimeWidget {
	constructor(userPreferences: DeepPartial<WidgetPreferences>) {
		super(userPreferences);
	}

	private async initialise() {
		this.online = await this.isOnline();

		const widgetPreferences: WidgetPreferences = await this.loadPreferences();
		if (!widgetPreferences) this.initialiseWidgetPreferences(this.preferences);

		Location.current().then(async (location) => {
			this.preferences.data.location = location;
			await this.mergeAndSavePreferences({ data: { location: location } });
			console.log(`Location updated: ${JSON.stringify(location)}`);
		});
	}

	public async setup(): Promise<void> {
		await this.initialise();

		const today = new Date();

		const { location, prayerTimes } = this.preferences.data;

		if (!prayerTimes) {
			if (!this.online) {
				console.error("Script requires an internet connection to fetch prayer times for the first time.");
				return Script.complete();
			}
			await this.getSaveAladhanPrayerTime(location);
		} else {
			const todayData = this.getPrayerTimesForDay(prayerTimes, today);
			const numberOfPrayerTimes = this.getFilteredPrayerTimes(prayerTimes).length;

			this.getCurrentDistanceFromOfflineAladhanPrayerTime(todayData);

			if (numberOfPrayerTimes <= this.displayItems || this.offlineDataDistanceMetres > this.preferences.user.distanceToleranceMetres) {
				await this.getSaveAladhanPrayerTime(location);
			}

			if (this.preferences.data.prayerTimes) this.displayPrayerTimes(this.preferences.data.prayerTimes);
		}
	}

	private async displayPrayerTimes(prayerTimes: AladhanPrayerTime[]): Promise<void> {
		const widget = this.createWidget(
			prayerTimes,
			this.preferences.user.displayPrayerTimes,
			this.displayItems,
			this.widgetSize,
			this.offlineDataDistanceMetres,
		);

		if (config.runsInAccessoryWidget) {
			widget.addAccessoryWidgetBackground = true;
			Script.setWidget(widget);
		}

		await widget.presentMedium();
		Script.complete();
	}

	private initialiseWidgetPreferences(preferences: WidgetPreferences): void {
		this.savePreferences(preferences);
	}

	private getCurrentDistanceFromOfflineAladhanPrayerTime(aladhanPrayerTime: AladhanPrayerTime | undefined): void {
		if (aladhanPrayerTime && this.preferences.data.location) {
			const { meta } = aladhanPrayerTime;
			const distance = this.calculateDistance(this.preferences.data.location, meta);
			this.offlineDataDistanceMetres = this.roundToTwoDecimals(distance);
		}
	}

	private async getSaveAladhanPrayerTime(location: Location.CurrentLocation | undefined): Promise<void> {
		if (location) {
			this.preferences.data.prayerTimes = await this.fetchPrayerTimes(
				this.preferences.user.aladhan.method,
				location,
				this.preferences.user.offlineDays,
			);
			await this.savePreferences(this.preferences);
		}
	}
}
