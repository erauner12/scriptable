import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { addFileIconSettings } from "./scripts";

// https://github.com/rollup/rollup/issues/703#issuecomment-224984436 <-- passing args into config file
const ENTRY_FILE_PATH = process.env.file_path;
const DECODED_FILE_PATH = ENTRY_FILE_PATH
	? Buffer.from(ENTRY_FILE_PATH, "base64").toString("utf-8")
	: null;

console.log(DECODED_FILE_PATH);

const config = {
	input: DECODED_FILE_PATH,
	output: {
		dir: "dist",
		format: "es",
		plugins: [terser(), addFileIconSettings(DECODED_FILE_PATH!)],
	},
	plugins: [typescript(), nodeResolve()],
	watch: {
		include: "src/**",
	},
};

// ts-unused-exports:disable-next-line
export default [config];
