import type { DeepPartial } from "src/types/helpers";

export function mergeDeep<T>(target: T, source: DeepPartial<T>): T {
	for (const key in source) {
		const targetValue = target[key];
		const sourceValue = source[key];

		if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
			target[key] = sourceValue as any; // replace arrays, not merge them
		} else if (typeof targetValue === "object" && typeof sourceValue === "object") {
			target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue as any);
		} else {
			target[key] = sourceValue as any;
		}
	}

	return target;
}
