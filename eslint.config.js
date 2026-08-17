import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";

export default defineConfig([
	globalIgnores(["dist", "coverage"]),

	{
		files: ["**/*.{js,jsx}"],

		extends: [
			js.configs.recommended,
			reactHooks.configs.flat.recommended,
			reactRefresh.configs.vite,
			prettier,
		],

		plugins: {
			"simple-import-sort": simpleImportSort,
		},

		rules: {
			"simple-import-sort/imports": "error",
			"simple-import-sort/exports": "error",
		},

		languageOptions: {
			globals: globals.browser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
	},

	{
		files: ["e2e/**/*.mjs", "*.config.js"],
		languageOptions: {
			globals: globals.node,
		},
	},
]);
