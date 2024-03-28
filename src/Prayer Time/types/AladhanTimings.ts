import type { ValueOf } from "src/types/helpers";
import { createKeyGetter, createValueGetter } from "src/utilities/getters";

export interface AladhanTimingsRequestQueryLocation {
	date?: string;
	latitude: number;
	longitude: number;
	method?: AladhanTimingsMethodValues;
	shafaq?: AladhanTimingsShafaqValues;
	tune?: string;
	school?: AladhanTimingsSchoolValues;
	midnightMode?: AladhanTimingsMidnightModeValues;
	timezonestring?: string;
	latitudeAdjustmentMethod?: AladhanTimingsLatitudeAdjustmentMethodValues;
	adjustment?: number;
	iso8601?: boolean;
}

const aladhanTimingsMethod = {
	"Shia Ithna-Ashari": 0,
	"University of Islamic Sciences, Karachi": 1,
	"Islamic Society of North America": 2,
	"Muslim World League": 3,
	"Umm Al-Qura University, Makkah": 4,
	"Egyptian General Authority of Survey": 5,
	"Institute of Geophysics, University of Tehran": 7,
	"Gulf Region": 8,
	"Kuwait": 9,
	"Qatar": 10,
	"Majlis Ugama Islam Singapura, Singapore": 11,
	"Union Organization islamic de France": 12,
	"Diyanet İşleri Başkanlığı, Turkey": 13,
	"Spiritual Administration of Muslims of Russia": 14,
	"Moonsighting Committee Worldwide": 15,
	"Dubai (unofficial)": 16,
	"Custom": 99,
} as const;
export type AladhanTimingsMethodKeys = keyof typeof aladhanTimingsMethod;
export type AladhanTimingsMethodValues = ValueOf<typeof aladhanTimingsMethod>;
export const getAladhanTimingsMethodValue = createValueGetter(aladhanTimingsMethod);
export const getAladhanTimingsMethodKey = createKeyGetter<number>()(aladhanTimingsMethod);

const aladhanTimingsShafaq = {
	General: "general", // (Default)
	Ahmer: "ahmer",
	Abyad: "abyad",
} as const;
export type AladhanTimingsShafaqKeys = keyof typeof aladhanTimingsShafaq;
export type AladhanTimingsShafaqValues = ValueOf<typeof aladhanTimingsShafaq>;
export const getAladhanTimingsShafaqValue = createValueGetter(aladhanTimingsShafaq);
export const getAladhanTimingsShafaqKey = createKeyGetter<string>()(aladhanTimingsShafaq);

const aladhanTimingsSchool = {
	Shafi: 0, // (Default)
	Hanafi: 1,
} as const;
export type AladhanTimingsSchoolKeys = keyof typeof aladhanTimingsSchool;
export type AladhanTimingsSchoolValues = ValueOf<typeof aladhanTimingsSchool>;
export const getAladhanTimingsSchoolValue = createValueGetter(aladhanTimingsSchool);
export const getAladhanTimingsSchoolKey = createKeyGetter<number>()(aladhanTimingsSchool);

const aladhanTimingsMidnightMode = {
	Standard: 0, // (Default) Mid Sunset to Sunrise
	Jafari: 1, // Mid Sunset to Fajr
} as const;
export type AladhanTimingsMidnightModeKeys = keyof typeof aladhanTimingsMidnightMode;
export type AladhanTimingsMidnightModeValues = ValueOf<typeof aladhanTimingsMidnightMode>;
export const getAladhanTimingsMidnightModeValue = createValueGetter(aladhanTimingsMidnightMode);
export const getAladhanTimingsMidnightModeKey = createKeyGetter<number>()(aladhanTimingsMidnightMode);

const aladhanTimingsLatitudeAdjustmentMethod = {
	"Middle of the Night": 1, // (Default)
	"One Seventh": 2,
	"Angle Based": 3,
} as const;
export type AladhanTimingsLatitudeAdjustmentMethodKeys = keyof typeof aladhanTimingsLatitudeAdjustmentMethod;
export type AladhanTimingsLatitudeAdjustmentMethodValues = ValueOf<typeof aladhanTimingsLatitudeAdjustmentMethod>;
export const getAladhanTimingsLatitudeAdjustmentMethodValue = createValueGetter(aladhanTimingsLatitudeAdjustmentMethod);
export const getAladhanTimingsLatitudeAdjustmentMethodKey = createKeyGetter<number>()(aladhanTimingsLatitudeAdjustmentMethod);
