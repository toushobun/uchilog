import type { TransactionCategoryOption } from "types/transactions";

import type { CategoryPickerGroup } from "./TransactionForm.types";

export function buildCategoryPickerGroups(
  categories: TransactionCategoryOption[],
) {
  return categories.reduce<CategoryPickerGroup[]>((groups, category) => {
    const groupId = category.parentId ?? "";
    const groupName = category.parentName ?? category.name;
    const group = groups.find((currentGroup) => currentGroup.id === groupId);

    if (group) {
      group.categories.push(category);
      return groups;
    }

    groups.push({ categories: [category], id: groupId, name: groupName });
    return groups;
  }, []);
}

export function formatCategoryName(category: TransactionCategoryOption) {
  return category.parentName
    ? `${category.parentName} / ${category.name}`
    : category.name;
}

export function formatSummaryDateTime(date: string, time: string) {
  const dateParts = date.split("-");
  if (dateParts.length !== 3) return "未选择";

  const timeParts = time.split(":");
  if (timeParts.length < 2) return "未选择";

  return `${dateParts[0]}/${dateParts[1]}/${dateParts[2]} ${timeParts[0]}:${timeParts[1]}:${timeParts[2] ?? "00"}`;
}

export function formatSignedCurrencyAmount(value: string, currency?: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue || trimmedValue === "未填写金额") return value;

  const sign = trimmedValue.startsWith("-")
    ? "-"
    : trimmedValue.startsWith("+")
      ? "+"
      : "";
  const amount = sign ? trimmedValue.slice(1) : trimmedValue;
  const normalizedCurrency = currency?.trim().toUpperCase();
  const symbol = normalizedCurrency
    ? (currencySymbols[normalizedCurrency] ?? normalizedCurrency)
    : "";

  return [sign, symbol, amount].filter(Boolean).join(" ");
}

export function isValidMoneyText(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;

  const [integerPart, decimalPart, extraPart] = trimmed.split(".");
  if (extraPart !== undefined) return false;
  if (!integerPart || !isDigitText(integerPart)) return false;
  if (decimalPart !== undefined) {
    if (decimalPart.length < 1 || decimalPart.length > 2) return false;
    if (!isDigitText(decimalPart)) return false;
  }

  const amount = Number(trimmed);

  return Number.isFinite(amount) && amount >= 0;
}

function isDigitText(value: string) {
  return Array.from(value).every((char) => char >= "0" && char <= "9");
}

const currencySymbols: Record<string, string> = {
  CNY: "¥",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  KRW: "₩",
  USD: "$",
};
