import { PrayerTimeWidget } from "src/Prayer Time/models/PrayerTime/PrayerTimeWidget";
import type { WidgetPreferences } from "src/Prayer Time/types";
import type { DeepPartial } from "src/types/helpers";
import { isOnline } from "src/utilities";

export class PrayerTime extends PrayerTimeWidget {
	constructor(userPreferences?: DeepPartial<WidgetPreferences>) {
		super(userPreferences);
	}

	public async initialise(onLocation: (PrayerTime: PrayerTime) => Promise<void>): Promise<void> {
		this.preferences = await this.loadPreferences();

		this.online = await isOnline();

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
			this.distanceFromOfflineData = this.calculateDistanceFromDeviceLocation(todayData?.meta);

			if (this.online) {
				const shouldFetchPrayerTimes =
					numberOfPrayerTimes <= this.displayItems || this.distanceFromOfflineData > this.preferences.user.distanceToleranceMetres;
				if (shouldFetchPrayerTimes) {
					await this.fetchAndSavePrayerTimes(this.preferences.data.location);
				}
			}
		} else {
			if (!this.online) {
				console.warn("Script requires an internet connection to fetch prayer times for the first time.");
				return Script.complete();
			} else {
				// Online and initial fetch, or no data
				await this.fetchAndSavePrayerTimes(this.preferences.data.location);
			}
		}
	}

	public async displayWidget(): Promise<void> {
		if (this.preferences.data.prayerTimes) {
			const widget = this.createWidget(this.preferences.data.prayerTimes, this.distanceFromOfflineData);

			if (config.runsInAccessoryWidget) {
				widget.addAccessoryWidgetBackground = true;
				Script.setWidget(widget);
			}

			await widget.presentLarge();
		}
	}
}
