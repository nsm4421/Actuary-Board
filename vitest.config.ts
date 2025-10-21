import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      reporter: ["text", "html"],
    },
    setupFiles: ["tests/setup/jest-dom.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@tests": resolve(__dirname, "tests"),
    },
  },
  esbuild: {
    jsx: "automatic",
  },
});
