import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { addFileIconSettings } from "./scripts";

// https://github.com/rollup/rollup/issues/703#issuecomment-224984436 <-- passing args into config file
const ENTRY_FILE_PATH = process.env.file_path;
const DECODED_FILE_PATH = ENTRY_FILE_PATH ? Buffer.from(ENTRY_FILE_PATH, "base64").toString("utf-8") : null;

const config = {
	input: DECODED_FILE_PATH,
	output: {
		dir: "dist",
		format: "es", // Ensure output format is ES module
		plugins: [terser(), addFileIconSettings(DECODED_FILE_PATH)],
	},
	plugins: [
		typescript({
			tsconfig: "./tsconfig.json", // Make sure to point to your tsconfig file
			target: "ES6", // Target ES6 explicitly for TypeScript compilation
		}),
		nodeResolve(),
	],
	watch: {
		include: "src/**",
	},
};

// ts-unused-exports:disable-next-line
export default [config];
