import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
      accounts: new URL("./src/components/organisms/accounts", import.meta.url)
        .pathname,
      auth: new URL("./src/components/organisms/auth", import.meta.url)
        .pathname,
      "dashboard-page": new URL(
        "./src/components/pages/dashboard",
        import.meta.url,
      ).pathname,
      lib: new URL("./src/lib", import.meta.url).pathname,
      "protected-template": new URL(
        "./src/components/templates/protected",
        import.meta.url,
      ).pathname,
      server: new URL("./src/server", import.meta.url).pathname,
      "settings-components": new URL(
        "./src/components/molecules/settings",
        import.meta.url,
      ).pathname,
      theme: new URL("./src/theme", import.meta.url).pathname,
      types: new URL("./src/types", import.meta.url).pathname,
      utils: new URL("./src/utils", import.meta.url).pathname,
      "theme-components": new URL(
        "./src/components/molecules/theme",
        import.meta.url,
      ).pathname,
      transactions: new URL(
        "./src/components/organisms/transactions",
        import.meta.url,
      ).pathname,
      ui: new URL("./src/components/atoms/ui", import.meta.url).pathname,
      "ui-molecules": new URL("./src/components/molecules/ui", import.meta.url)
        .pathname,
    },
  },
  test: {
    environment: "node",
  },
});
