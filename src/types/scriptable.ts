import type { PropertiesOf } from "src/types/helpers";
import { getRunLocation } from "src/utilities/scriptable/common";

export type WidgetSize = NonNullable<typeof config.widgetFamily>;

export type RunLocation = ReturnType<typeof getRunLocation>;

export type RequestProperties = Pick<Request, PropertiesOf<Request>>;
