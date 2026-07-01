export function getCurrencySymbol(currency?: string) {
  const normalizedCurrency = currency?.trim().toUpperCase();
  if (!normalizedCurrency) return "¥";

  return currencySymbols[normalizedCurrency] ?? normalizedCurrency;
}

const currencySymbols: Record<string, string> = {
  CNY: "¥",
  EUR: "€",
  GBP: "£",
  HKD: "HK$",
  JPY: "¥",
  KRW: "₩",
  SGD: "S$",
  THB: "฿",
  TWD: "NT$",
  USD: "$",
};
