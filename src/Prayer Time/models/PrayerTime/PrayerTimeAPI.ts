import { AladhanTimings } from "src/Prayer Time/models/AladhanTimings";
import { PrayerTimeFileSystem } from "src/Prayer Time/models/PrayerTime/PrayerTimeFileSystem";
import type { AladhanPrayerTime, WidgetPreferences } from "src/Prayer Time/types";
import type { DeepPartial } from "src/types/helpers";
import { handleError } from "src/utilities";

export class PrayerTimeAPI extends PrayerTimeFileSystem {
	constructor(userPreferences?: DeepPartial<WidgetPreferences>) {
		super(userPreferences);
	}

	protected async fetchPrayerTimes(location: { latitude: number; longitude: number }): Promise<AladhanPrayerTime[]> {
		try {
			const { latitude, longitude } = location;

			const aladhanTimings = new AladhanTimings({
				latitude,
				longitude,
				method: this.preferences.user.aladhan.method,
			});

			const newPrayerTimes: AladhanPrayerTime[] = await aladhanTimings.getPrayerTimes(new Date(), this.preferences.user.offlineDays);

			return aladhanTimings.mergePrayerTimes(newPrayerTimes, this.preferences.data.prayerTimes, this.preferences.user.offlineDays);
		} catch (error) {
			throw handleError(error);
		}
	}
}
