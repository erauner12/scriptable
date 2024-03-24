import type { DeepPartial } from "src/types/helpers";

export function getSettings<T>(
	defaultSettings: T,
	userSettings: DeepPartial<T> | ((defaultSettings: T) => DeepPartial<T>),
	overrideSettings?: DeepPartial<T>,
): T {
	const settingsToApply: DeepPartial<T> = typeof userSettings === "function" ? userSettings(defaultSettings) : userSettings;
	const mergedSettings = mergeDeep(Object.assign({}, defaultSettings), settingsToApply);

	if (overrideSettings) {
		return mergeDeep(mergedSettings, overrideSettings);
	}

	return mergedSettings;
}

function mergeDeep<T>(target: T, source: DeepPartial<T>): T {
	for (const key in source) {
		const targetValue = target[key];
		const sourceValue = source[key];

		if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
			target[key] = sourceValue as any; // replace arrays, not merge them
		} else if (typeof targetValue === "object" && typeof sourceValue === "object") {
			target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue as any);
		} else {
			target[key] = sourceValue as any;
		}
	}

	return target;
}
