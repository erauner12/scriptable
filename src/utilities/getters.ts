export function createValueGetter<TObject extends Object>(
	obj: TObject
): <TKey extends keyof TObject>(
	key: TKey | string | undefined
) => TObject[keyof TObject] | undefined {
	return <TKey extends keyof TObject>(
		key: TKey | string | undefined
	): TObject[keyof TObject] | undefined => {
		if (!key) return undefined;
		if (key in obj) return obj[key as keyof TObject];
		return undefined;
	};
}

export function createKeyGetter<V>() {
	return <TObject extends Record<keyof TObject, V>>(obj: TObject) => {
		return (value: V | undefined): keyof TObject | undefined => {
			if (!value) return undefined;
			return (Object.keys(obj) as Array<keyof TObject>).find(
				(key) => obj[key] === value
			);
		};
	};
}
