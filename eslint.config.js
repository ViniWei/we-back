import globals from "globals";
import { defineConfig } from "eslint/config";


export default defineConfig([
    { files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.node } },
    {
        rules: {
            "no-unreachable": "error",
            "no-unused-expressions": "error",
            "no-unused-vars": "error",
            "prefer-const": "error",
            "quotes": ["error", "double"],
            "indent": ["error", 4],
            "semi": ["error"],
        },
    },
]);
