const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // Scoped to TS files: that's where expo's config loads the @typescript-eslint plugin.
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // Allow underscore-prefixed names as intentional "unused" markers (caught errors, etc.)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  }
]);
