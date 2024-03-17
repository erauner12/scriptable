export function getSettings<T>(
	defaultSettings: T,
	userSettingsCallback: (defaultSettings: T) => Partial<T>,
	overrideSettings?: Partial<T>
): T {
	const userSettings: Partial<T> = userSettingsCallback(defaultSettings);
	return { ...defaultSettings, ...userSettings, ...overrideSettings };
}
