import { getRunLocation } from "src/utilities/scriptable/getRunLocation";

export type WidgetSize = NonNullable<typeof config.widgetFamily>;

export type RunLocation = ReturnType<typeof getRunLocation>;
