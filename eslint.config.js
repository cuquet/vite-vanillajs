import globals from "globals";
import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
    // 🌍 Config global per a codi del navegador
    {
        languageOptions: {
            globals: globals.browser,
        },
    },
    pluginJs.configs.recommended,
    eslintConfigPrettier,

    // 🧩 Config addicional per a fitxers Node (.mjs, .cjs, scripts de build)
    {
        files: ['**/*.mjs', '**/*.cjs', 'vite.config.*'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        env: {
            node: true,
            es2021: true,
        },
    },
];
