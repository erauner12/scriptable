export function getWidgetParameters<T>(
	widgetParameters: string,
	delimiter: string,
	userSettingsCallback: (parsedWidgetParameters: string[]) => Partial<T>,
): Partial<T> {
	if (typeof widgetParameters === "string" && widgetParameters.trim().length > 0) {
		const parsedWidgetParameters = widgetParameters.split(delimiter).map((parameter) => parameter.trim());

		return userSettingsCallback(parsedWidgetParameters);
	}

	return {};
}
