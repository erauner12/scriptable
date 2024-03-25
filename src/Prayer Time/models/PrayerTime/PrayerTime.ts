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

		if (!this.preferences.data.prayerTimes) {
			if (!this.online) {
				console.error("Script requires an internet connection to fetch prayer times for the first time.");
				return Script.complete();
			}

			await this.getSaveAladhanPrayerTime(this.preferences.data.location);
		} else {
			const todayData = this.getPrayerTimeForDay(this.preferences.data.prayerTimes);
			const numberOfPrayerTimes = this.getFilteredPrayerTimes(this.preferences.data.prayerTimes).length;

			this.offlineDataDistanceMetres = this.calculateDistanceFromLocation(todayData);

			if (numberOfPrayerTimes <= this.displayItems || this.offlineDataDistanceMetres > this.preferences.user.distanceToleranceMetres) {
				await this.getSaveAladhanPrayerTime(this.preferences.data.location);
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

	private calculateDistanceFromLocation(prayerTime: AladhanPrayerTime | undefined): number {
		if (prayerTime && this.preferences.data.location) {
			const distance = this.calculateDistance(this.preferences.data.location, prayerTime.meta);
			return this.roundToTwoDecimals(distance);
		}

		return this.preferences.user.distanceToleranceMetres;
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
