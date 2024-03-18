import type { ValueOf } from "src/types/helpers";
import { createKeyGetter, createValueGetter } from "src/utilities/getters";

export type AladhanTimingsRequestQueryLocation = {
	[key: string]: string | number | boolean | null | undefined;
	date?: string;
	latitude: number;
	longitude: number;
	method?: number;
	shafaq?: string;
	tune?: string;
	school?: number;
	midnightMode?: number;
	timezonestring?: string;
	latitudeAdjustmentMethod?: number;
	adjustment?: number;
	iso8601?: boolean;
};

const aladhanTimingsMethod = {
	"Shia Ithna-Ashari": 0,
	"University of Islamic Sciences, Karachi": 1,
	"Islamic Society of North America": 2,
	"Muslim World League": 3,
	"Umm Al-Qura University, Makkah": 4,
	"Egyptian General Authority of Survey": 5,
	"Institute of Geophysics, University of Tehran": 7,
	"Gulf Region": 8,
	Kuwait: 9,
	Qatar: 10,
	"Majlis Ugama Islam Singapura, Singapore": 11,
	"Union Organization islamic de France": 12,
	"Diyanet İşleri Başkanlığı, Turkey": 13,
	"Spiritual Administration of Muslims of Russia": 14,
	"Moonsighting Committee Worldwide": 15,
	"Dubai (unofficial)": 16,
	Custom: 99,
} as const;

export type AladhanTimingsMethodKeys = keyof typeof aladhanTimingsMethod;
export type AladhanTimingsMethodValues = ValueOf<typeof aladhanTimingsMethod>;
export const getAladhanTimingsMethodValue =
	createValueGetter(aladhanTimingsMethod);
export const getAladhanTimingsMethodKey =
	createKeyGetter<Number>()(aladhanTimingsMethod);
