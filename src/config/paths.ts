export const routePaths = {
  accounts: "/accounts",
  categories: "/categories",
  dashboard: "/dashboard",
  home: "/",
  ledgerSetup: "/ledger-setup",
  ledgers: "/ledgers",
  login: "/login",
  merchants: "/merchants",
  settings: "/settings",
  statistics: "/statistics",
  transactions: "/transactions",
  transactionsNew: "/transactions/new",
} as const;

export type AppRouteKey = keyof typeof routePaths;
export type AppRoutePath = (typeof routePaths)[AppRouteKey];

export const bottomNavigationRouteGroups = {
  left: [
    { href: routePaths.dashboard, label: "首页" },
    { href: routePaths.transactions, label: "明细" },
  ],
  right: [
    { href: routePaths.statistics, label: "统计" },
    { href: routePaths.settings, label: "设置" },
  ],
} as const;

export function routeWithQuery(
  path: AppRoutePath,
  params: Record<string, string | null | undefined>,
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const query = searchParams.toString();

  return query ? `${path}?${query}` : path;
}

export function statisticsMonthHref(month: string) {
  return routeWithQuery(routePaths.statistics, { month });
}

export function transactionsMonthHref(month: string) {
  return routeWithQuery(routePaths.transactions, { month });
}

export function transactionsErrorHref(error: string) {
  return routeWithQuery(routePaths.transactions, { error });
}

export function newTransactionErrorHref(error: string) {
  return routeWithQuery(routePaths.transactionsNew, { error });
}

export function accountsErrorHref(error: string) {
  return routeWithQuery(routePaths.accounts, { error });
}

export function categoriesErrorHref(error: string, categoryId?: string | null) {
  return routeWithQuery(routePaths.categories, { error, categoryId });
}

export function ledgerSetupErrorHref(error: string) {
  return routeWithQuery(routePaths.ledgerSetup, { error });
}

export function merchantsErrorHref(error: string, merchantId?: string | null) {
  return routeWithQuery(routePaths.merchants, { error, merchantId });
}
