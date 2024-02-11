export interface Preferences {
	widget: {
		settings: {
			file: string;
			directory: string;
			size: string;
			offline: number;
		};
		display: {
			prayerTimes: PrayerTime[];
		};
	};
	api: {
		endpoint: string;
		method?: number;
		location: {
			latitude: number;
			longitude: number;
		};
	};
}

type PrayerTime = {
	name: string;
	display: string;
};

export interface APIData extends Object {
	timings: Timings;
	date: DateClass;
	meta: Meta;
}

interface DateClass {
	hijri: Hijri;
	gregorian: Gregorian;
	timestamp: string;
	readable: string;
}

interface Gregorian {
	format: string;
	day: string;
	weekday: GregorianWeekday;
	date: string;
	month: GregorianMonth;
	year: string;
	designation: Designation;
}

interface Designation {
	expanded: string;
	abbreviated: string;
}

interface GregorianMonth {
	number: number;
	en: string;
}

interface GregorianWeekday {
	en: string;
}

interface Hijri {
	format: string;
	day: string;
	weekday: HijriWeekday;
	date: string;
	month: HijriMonth;
	year: string;
	designation: Designation;
	holidays: any[];
}

interface HijriMonth {
	number: number;
	en: string;
	ar: string;
}

interface HijriWeekday {
	en: string;
	ar: string;
}

interface Meta {
	method: Method;
	school: string;
	longitude: number;
	latitudeAdjustmentMethod: string;
	offset: { [key: string]: number };
	timezone: string;
	latitude: number;
	midnightMode: string;
}

interface Method {
	id: number;
	name: string;
	params: Params;
	location: Location;
}

interface Location {
	longitude: number;
	latitude: number;
}

interface Params {
	Fajr: number;
	Isha: number;
}

interface Timings {
	Asr: string;
	Sunset: string;
	Maghrib: string;
	Imsak: string;
	Lastthird: string;
	Isha: string;
	Midnight: string;
	Dhuhr: string;
	Firstthird: string;
	Sunrise: string;
	Fajr: string;
}
