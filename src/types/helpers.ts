/**
 * Transforms type `T` into a prettier representation, which can help with the display of complex types in IntelliSense.
 * This type doesn't change the structure but can affect how the type is visualized in some editors.
 * @template T - The type to be transformed.
 * @typedef Prettify
 * @example
 * // Given a complex type:
 * // type Complex = { a: number; b: string; c: boolean; };
 * // Using Prettify would not change the structure but might affect its display:
 * // type PrettyComplex = Prettify<Complex>;
 */
export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

/**
 * Represents an array type that is guaranteed to have at least one item of type `T`.
 * @template T - The type of items in the array.
 * @typedef NonEmptyArray
 * @example
 * // This type will enforce arrays to have at least one element:
 * // const validArray: NonEmptyArray<number> = [1];
 * // const invalidArray: NonEmptyArray<number> = []; // TypeScript error
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Creates a type that represents all the properties of `T` as optional, and if the properties are objects,
 * their properties are also recursively marked as optional.
 * @template T - The type whose properties are to be made deeply optional.
 * @typedef DeepPartial
 * @example
 * // Given a type with nested properties:
 * // type Nested = { a: number; b: { c: string; d: boolean; } };
 * // The DeepPartial type would make all properties optional:
 * // type PartialNested = DeepPartial<Nested>;
 * // This allows for partial objects:
 * // const partial: PartialNested = { b: { c: "hello" } };
 */
export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extracts the types of values from a given object type.
 * @template T The object type from which value types are to be extracted.
 * @typedef {T[keyof T]} ValueOf
 * @example
 * type Example = { a: number; b: string; c: boolean };
 * type ValueTypes = ValueOf<Example>; // number | string | boolean
 */
export type ValueOf<T> = T[keyof T];

/**
 * Obtains the key type that corresponds to a specific value type in an object.
 * If the value type does not exist in the object, the resulting type is 'never'.
 * @template T The object type from which the key is to be extracted.
 * @template V The value type for which the corresponding key type is desired.
 * @typedef {{ [K in keyof T]: T[K] extends V ? K : never }[keyof T]} KeyByValue
 * @example
 * type Example = { a: 'foo'; b: 'bar'; c: 'baz' };
 * type KeyForBar = KeyByValue<Example, 'bar'>; // 'b'
 * type KeyForQux = KeyByValue<Example, 'qux'>; // never (since 'qux' is not a value in Example)
 */
export type KeyByValue<T, V> = {
	[K in keyof T]: T[K] extends V ? K : never;
}[keyof T];
