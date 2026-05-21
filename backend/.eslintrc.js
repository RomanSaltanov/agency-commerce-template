module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    ecmaVersion: 2021,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    // Force @medusajs/framework/utils zod wrapper — bare "zod" bypasses validation patterns
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "zod",
            message: "Import zod via @medusajs/framework/utils instead: import { z } from '@medusajs/framework/utils'",
          },
        ],
      },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  },
  ignorePatterns: ["dist/", ".medusa/", "node_modules/"],
}
