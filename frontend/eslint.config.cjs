const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const globals = require("globals");

const {
    fixupConfigRules,
    fixupPluginRules,
} = require("@eslint/compat");

const tsParser = require("@typescript-eslint/parser");
const relay = require("eslint-plugin-relay");
const reactRefresh = require("eslint-plugin-react-refresh");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    languageOptions: {
        globals: {
            ...globals.browser,
        },

        parser: tsParser,
    },

    extends: fixupConfigRules(compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react-hooks/recommended",
        "plugin:relay/recommended",
        "prettier",
        "plugin:testing-library/react",
    )),

    plugins: {
        relay: fixupPluginRules(relay),
        "react-refresh": reactRefresh,
    },

    rules: {
        //TODO
        // "react-refresh/only-export-components": ["warn", {
        //     allowConstantExport: true,
        // }],

        "@typescript-eslint/no-explicit-any": ["warn"],

        "@typescript-eslint/no-unused-vars": ["error", {
            argsIgnorePattern: "^_",
        }],

        "testing-library/no-manual-cleanup": "off",
    },
}, globalIgnores(["**/build", "**/.eslintrc.cjs"])]);
