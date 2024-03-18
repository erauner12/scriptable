import type { DeepPartial } from "src/types/helpers";

export function getSettings<T>(
	defaultSettings: T,
	userSettings: DeepPartial<T> | ((defaultSettings: T) => DeepPartial<T>),
	overrideSettings?: DeepPartial<T>,
): T {
	const settings: DeepPartial<T> = typeof userSettings === "function" ? userSettings(defaultSettings) : userSettings;
	return { ...defaultSettings, ...settings, ...overrideSettings };
}
