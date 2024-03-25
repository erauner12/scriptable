import { PrayerTime } from "src/Prayer Time/models/PrayerTime";
import type { AladhanPrayerTime, WidgetPreferences } from "src/Prayer Time/types";
import type { DeepPartial } from "src/types/helpers";

export class PrayerTimeWidget extends PrayerTime {
	constructor(userPreferences: DeepPartial<WidgetPreferences>) {
		super(userPreferences);
	}

	private async initialise() {
		this.online = await this.isOnline();

		const widgetPreferences: WidgetPreferences = await this.fileManager.readJSON(this.filePath);
		if (!widgetPreferences) this.initialiseWidgetPreferences(this.preferences);

		Location.current().then(async (location) => {
			this.preferences.data.location = location;
			await this.mergePreferencesAndSave(this.preferences, { data: { location: location } });
		});
	}

	public async setup() {
		await this.initialise();

		const today = new Date();

		const { location, prayerTimes } = this.preferences.data;

		if (!prayerTimes) {
			if (!this.online) throw Error("Device is offline, and no Prayer Times are stored.");
			await this.getSaveAladhanPrayerTime(location);
		} else {
			const todayData = this.getDay(prayerTimes, today);
			const numberOfPrayerTimes = this.getPrayerTimes(prayerTimes, this.preferences.user.displayPrayerTimes).length;

			this.getCurrentDistanceFromOfflineAladhanPrayerTime(todayData);

			if (numberOfPrayerTimes <= this.displayItems || this.offlineDataDistanceMetres > this.preferences.user.distanceToleranceMetres) {
				await this.getSaveAladhanPrayerTime(location);
			}

			if (this.preferences.data.prayerTimes) this.displayPrayerTimes(this.preferences.data.prayerTimes);
		}
	}

	private async displayPrayerTimes(prayerTimes: AladhanPrayerTime[]) {
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

	private initialiseWidgetPreferences(preferences: WidgetPreferences) {
		this.savePreferences(preferences);
	}

	private getCurrentDistanceFromOfflineAladhanPrayerTime(aladhanPrayerTime: AladhanPrayerTime | undefined) {
		if (aladhanPrayerTime && this.preferences.data.location) {
			const { meta } = aladhanPrayerTime;
			const distance = this.calculateDistance(this.preferences.data.location, meta);
			this.offlineDataDistanceMetres = this.roundToTwoDecimals(distance);
		}
	}

	private async getSaveAladhanPrayerTime(location: Location.CurrentLocation | undefined) {
		if (location) {
			this.preferences.data.prayerTimes = await this.getAladhanTimings(
				this.preferences.user.aladhan.method,
				location,
				this.preferences.user.offlineDays,
			);
			await this.savePreferences(this.preferences);
		}
	}
}
