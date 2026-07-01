import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-dev-alt/**",
    ".data/**",
    "out/**",
    "build/**",
    "public/supersplat-editor/**",
    "public/supersplat-viewer/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
