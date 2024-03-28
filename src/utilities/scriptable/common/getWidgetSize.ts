import type { WidgetSize } from "src/types/scriptable";

export function getWidgetSize(defaultSize: WidgetSize = "small"): WidgetSize {
	return config.widgetFamily ? config.widgetFamily : defaultSize;
}
