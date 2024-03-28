/**
 * @type {import('eslint').Linter.Config}
 */

module.exports = {
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: "module",
	},
	env: {
		node: true,
	},
	plugins: ["@typescript-eslint", "prettier", "import"],
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:prettier/recommended",
		"plugin:import/recommended",
		"plugin:import/typescript",
	],
	rules: {
		"prettier/prettier": "warn",
		"sort-imports": [
			"error",
			{
				ignoreCase: false,
				ignoreDeclarationSort: true,
				ignoreMemberSort: false,
				memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
				allowSeparatedGroups: true,
			},
		],
		"import/no-unresolved": "warn",
		"import/order": [
			"warn",
			{
				"groups": [
					"builtin", // Built-in imports (come from NodeJS native) go first
					"external", // <- External imports
					"internal", // <- Absolute imports
					["sibling", "parent"], // <- Relative imports, the sibling and parent types they can be mingled together
					"index", // <- index imports
					"unknown", // <- unknown
				],
				"newlines-between": "always",
				"alphabetize": {
					order: "asc",
					caseInsensitive: true,
				},
			},
		],
	},
	settings: {
		"import/resolver": {
			typescript: {
				project: "./tsconfig.json",
			},
		},
	},
	ignorePatterns: ["dist/*"],
};
