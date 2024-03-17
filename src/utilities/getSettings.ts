export function getSettings<T>(
	defaultSettings: T,
	userSettings: Partial<T> | ((defaultSettings: T) => Partial<T>),
	overrideSettings?: Partial<T>
): T {
	const settings: Partial<T> =
		typeof userSettings === "function"
			? userSettings(defaultSettings)
			: userSettings;
	return { ...defaultSettings, ...settings, ...overrideSettings };
}
