import { PrayerTimeWidget } from "src/Prayer Time/models/PrayerTime/PrayerTimeWidget";
import type { AladhanPrayerTime, WidgetPreferences } from "src/Prayer Time/types";
import type { DeepPartial } from "src/types/helpers";

export class PrayerTime extends PrayerTimeWidget {
	constructor(userPreferences: DeepPartial<WidgetPreferences>) {
		super(userPreferences);
	}

	public async initialise(onLocation: (PrayerTime: PrayerTime) => Promise<void>): Promise<void> {
		this.preferences = await this.loadPreferences();

		this.online = await this.isOnline();

		Location.current().then(async (location) => {
			this.preferences.data.location = location;
			await this.mergeAndSavePreferences({ data: { location: location } });
			Script.complete();
			await onLocation(this);
		});
	}

	public async setup(): Promise<void> {
		if (this.preferences.data.prayerTimes) {
			const todayData = this.getPrayerTimeForDay(this.preferences.data.prayerTimes);
			const numberOfPrayerTimes = this.getFilteredPrayerTimes(this.preferences.data.prayerTimes).length;

			this.offlineDataDistanceMetres = this.calculateDistanceFromLocation(todayData);

			if (numberOfPrayerTimes <= this.displayItems || this.offlineDataDistanceMetres > this.preferences.user.distanceToleranceMetres) {
				await this.fetchAndSavePrayerTimes(this.preferences.data.location);
			}
		}

		if (!this.online) {
			console.error("Script requires an internet connection to fetch prayer times for the first time.");
			return Script.complete();
		}

		await this.fetchAndSavePrayerTimes(this.preferences.data.location);
	}

	public async displayWidget(): Promise<void> {
		if (this.preferences.data.prayerTimes) {
			const widget = this.createWidget(
				this.preferences.data.prayerTimes,
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
		}
	}

	private async fetchAndSavePrayerTimes(location: Location.CurrentLocation | undefined): Promise<void> {
		if (!location) {
			console.error("Location not available. Please enable location services.");
			return Script.complete();
		}

		const prayerTimes = await this.fetchPrayerTimes(location);
		await this.mergeAndSavePreferences({ data: { prayerTimes } });
	}
}
