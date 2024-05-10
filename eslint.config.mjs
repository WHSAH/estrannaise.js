import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  { 
    rules: {
      semi: [2, 'always']
    },
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  }
];
