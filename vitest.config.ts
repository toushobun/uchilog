import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
      accounts: new URL("./src/components/accounts", import.meta.url).pathname,
      "account-page": new URL("./src/app/(protected)/accounts", import.meta.url)
        .pathname,
      theme: new URL("./src/theme", import.meta.url).pathname,
      ui: new URL("./src/components/ui", import.meta.url).pathname,
    },
  },
  test: {
    environment: "node",
  },
});
