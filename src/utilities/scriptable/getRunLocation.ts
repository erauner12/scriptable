export function getRunLocation() {
	if (config.runsFromHomeScreen) return "HomeScreen";
	if (config.runsInAccessoryWidget) return "AccessoryWidget";
	if (config.runsInActionExtension) return "ActionExtension";
	if (config.runsInApp) return "App";
	if (config.runsInNotification) return "Notification";
	if (config.runsInWidget) return "Widget";
	if (config.runsWithSiri) return "Siri";
	return "Unknown";
}
