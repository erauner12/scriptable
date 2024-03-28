import type { DeepPartial } from "src/types/helpers";
import { mergeDeep } from "src/utilities";

export function getSettings<T>(
	defaultSettings: T,
	userSettings?: DeepPartial<T> | ((defaultSettings: T) => DeepPartial<T>),
	overrideSettings?: DeepPartial<T>,
): T {
	const settingsToApply: DeepPartial<T> = typeof userSettings === "function" ? userSettings(defaultSettings) : userSettings || {};

	const mergedSettings = mergeDeep(Object.assign({}, defaultSettings), settingsToApply);

	if (overrideSettings) {
		return mergeDeep(mergedSettings, overrideSettings);
	}

	return mergedSettings;
}
