import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
      "accounts-molecules": new URL(
        "./src/components/molecules/accounts",
        import.meta.url,
      ).pathname,
      accounts: new URL("./src/components/organisms/accounts", import.meta.url)
        .pathname,
      "accounts-page": new URL(
        "./src/components/pages/accounts",
        import.meta.url,
      ).pathname,
      "accounts-template": new URL(
        "./src/components/templates/accounts",
        import.meta.url,
      ).pathname,
      auth: new URL("./src/components/organisms/auth", import.meta.url)
        .pathname,
      "categories-page": new URL(
        "./src/components/pages/categories",
        import.meta.url,
      ).pathname,
      "categories-template": new URL(
        "./src/components/templates/categories",
        import.meta.url,
      ).pathname,
      "dashboard-molecules": new URL(
        "./src/components/molecules/dashboard",
        import.meta.url,
      ).pathname,
      "dashboard-page": new URL(
        "./src/components/pages/dashboard",
        import.meta.url,
      ).pathname,
      "dashboard-template": new URL(
        "./src/components/templates/dashboard",
        import.meta.url,
      ).pathname,
      "home-page": new URL("./src/components/pages/home", import.meta.url)
        .pathname,
      "home-template": new URL(
        "./src/components/templates/home",
        import.meta.url,
      ).pathname,
      "ledger-setup-page": new URL(
        "./src/components/pages/ledger-setup",
        import.meta.url,
      ).pathname,
      "ledger-setup-template": new URL(
        "./src/components/templates/ledger-setup",
        import.meta.url,
      ).pathname,
      "ledgers-page": new URL("./src/components/pages/ledgers", import.meta.url)
        .pathname,
      "ledgers-template": new URL(
        "./src/components/templates/ledgers",
        import.meta.url,
      ).pathname,
      lib: new URL("./src/lib", import.meta.url).pathname,
      "login-page": new URL("./src/components/pages/login", import.meta.url)
        .pathname,
      "login-template": new URL(
        "./src/components/templates/login",
        import.meta.url,
      ).pathname,
      merchants: new URL(
        "./src/components/organisms/merchants",
        import.meta.url,
      ).pathname,
      "merchants-page": new URL(
        "./src/components/pages/merchants",
        import.meta.url,
      ).pathname,
      "merchants-template": new URL(
        "./src/components/templates/merchants",
        import.meta.url,
      ).pathname,
      "navigation-molecules": new URL(
        "./src/components/molecules/navigation",
        import.meta.url,
      ).pathname,
      providers: new URL("./src/components/providers", import.meta.url)
        .pathname,
      "protected-template": new URL(
        "./src/components/templates/protected",
        import.meta.url,
      ).pathname,
      "root-template": new URL(
        "./src/components/templates/root",
        import.meta.url,
      ).pathname,
      config: new URL("./src/config", import.meta.url).pathname,
      "settings-page": new URL(
        "./src/components/pages/settings",
        import.meta.url,
      ).pathname,
      "settings-template": new URL(
        "./src/components/templates/settings",
        import.meta.url,
      ).pathname,
      server: new URL("./src/server", import.meta.url).pathname,
      "settings-components": new URL(
        "./src/components/molecules/settings",
        import.meta.url,
      ).pathname,
      "statistics-page": new URL(
        "./src/components/pages/statistics",
        import.meta.url,
      ).pathname,
      "statistics-template": new URL(
        "./src/components/templates/statistics",
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
      "transactions-atoms": new URL(
        "./src/components/atoms/transactions",
        import.meta.url,
      ).pathname,
      "transactions-molecules": new URL(
        "./src/components/molecules/transactions",
        import.meta.url,
      ).pathname,
      "transactions-page": new URL(
        "./src/components/pages/transactions",
        import.meta.url,
      ).pathname,
      "transactions-template": new URL(
        "./src/components/templates/transactions",
        import.meta.url,
      ).pathname,
      ui: new URL("./src/components/atoms/ui", import.meta.url).pathname,
      "ui-molecules": new URL("./src/components/molecules/ui", import.meta.url)
        .pathname,
    },
  },
  test: {
    environment: "jsdom",
    deps: {
      optimizer: {
        web: {
          // MUI 文件数量较多，转换成本较高，因此提前预打包。
          include: ["@mui/material", "@mui/icons-material", "@mui/system"],
        },
      },
    },
  },
});
