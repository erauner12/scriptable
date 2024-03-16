export function getDefaultSettings<T>(
	defaultSettings: T,
	userSettingsCallback: () => Partial<T>,
	overrideSettings?: Partial<T>
): T {
	const userSettings: Partial<T> = userSettingsCallback();
	return { ...defaultSettings, ...userSettings, ...overrideSettings };
}
