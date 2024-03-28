/**
 * Creates a getter function to retrieve a value from an object based on a key.
 * If the key is not found, it returns undefined.
 *
 * @template TObject - The object type from which the value will be retrieved.
 * @param {TObject} obj - The object from which the getter will retrieve values.
 * @returns A function that accepts a key or string and returns the value associated with the key or undefined.
 * @example
 * const person = { name: 'Alice', age: 30 };
 * const getValue = createValueGetter(person);
 * console.log(getValue('name')); // Outputs: 'Alice'
 * console.log(getValue('nonexistentKey')); // Outputs: undefined
 */
export function createValueGetter<TObject extends object>(
	obj: TObject,
): <TKey extends keyof TObject>(key: TKey | string | undefined) => TObject[keyof TObject] | undefined {
	return <TKey extends keyof TObject>(key: TKey | string | undefined): TObject[keyof TObject] | undefined => {
		if (!key) return undefined;
		if (key in obj) return obj[key as keyof TObject];
		return undefined;
	};
}

/**
 * Creates a higher-order function to generate a key getter based on the specified value type.
 * The getter function can be used to find the key associated with a specific value in the object.
 * If the value is not found, it returns undefined.
 *
 * @template V - The type of values in the object.
 * @returns A higher-order function that accepts an object and returns a getter function.
 * @example
 * const methodCodes = { a: 1, b: 2, c: 3 };
 * const getKey = createKeyGetter<number>()(methodCodes);
 * console.log(getKey(2)); // Outputs: 'b'
 * console.log(getKey(4)); // Outputs: undefined
 */
export function createKeyGetter<V>() {
	return <TObject extends Record<keyof TObject, V>>(obj: TObject) => {
		return (value: V | undefined): keyof TObject | undefined => {
			if (!value) return undefined;
			return (Object.keys(obj) as Array<keyof TObject>).find((key) => obj[key] === value);
		};
	};
}
