import type { DeepPartial } from "src/types/helpers";

export function mergeDeep<T>(target: T, source: DeepPartial<T>): T {
	for (const key in source) {
		const targetValue = target[key];
		const sourceValue = source[key];

		if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
			target[key] = sourceValue as (typeof target)[typeof key]; // replace arrays, not merge them
		} else if (typeof targetValue === "object" && typeof sourceValue === "object") {
			target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue as DeepPartial<(typeof target)[typeof key]>);
		} else {
			target[key] = sourceValue as (typeof target)[typeof key];
		}
	}

	return target;
}
