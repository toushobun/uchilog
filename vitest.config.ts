import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
      accounts: new URL("./src/components/accounts", import.meta.url).pathname,
      lib: new URL("./src/lib", import.meta.url).pathname,
      theme: new URL("./src/theme", import.meta.url).pathname,
      types: new URL("./src/types", import.meta.url).pathname,
      "transactions-route": new URL(
        "./src/app/(protected)/transactions",
        import.meta.url,
      ).pathname,
      transactions: new URL("./src/components/transactions", import.meta.url)
        .pathname,
      ui: new URL("./src/components/ui", import.meta.url).pathname,
    },
  },
  test: {
    environment: "node",
  },
});
