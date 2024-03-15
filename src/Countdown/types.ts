import { WidgetSize } from "../../types/scriptable";

export type WidgetDisplayLayout = {
	maxCountdownsToShow: number;
	rows: number;
	columns: number;
	spacing: number;
	width: number;
	height: number;
	nameFormat: "Nickname" | "FirstName" | "LastName"; // 1 = Nicknames, 2 = First name, 3 = Last name
};

export type WidgetLayout = Record<NonNullable<WidgetSize>, WidgetDisplayLayout>;
