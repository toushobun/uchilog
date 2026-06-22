import { serverFallbackTimeZone, transactionTimeLocale } from "config/dateTime";
import type {
  CategorySummaryItem,
  TransactionAmountSummary,
  TransactionDateGroup,
  TransactionListItem,
  TransactionRecordType,
} from "types/transactions";

const weekDayLabels = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export function formatNumber(amount: string) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return amount;

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatPlainAmount(amount: string, currency = "") {
  const formattedAmount = formatNumber(amount);

  return currency ? `${formattedAmount} ${currency}` : formattedAmount;
}

export function formatSignedNumber(amount: string) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return amount;

  const abs = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Math.abs(value));

  return value >= 0 ? `+${abs}` : `-${abs}`;
}

export function formatTransactionRowAmount(
  type: TransactionRecordType,
  amount: string,
  currency = "",
) {
  if (type === "transfer") return formatPlainAmount(amount, currency);

  return `${type === "expense" ? "-" : "+"}${formatPlainAmount(
    amount,
    currency,
  )}`;
}

export function getCategoryLabel(items: CategorySummaryItem[]): string | null {
  if (items.length === 0) return null;
  const top = items.reduce((a, b) =>
    Number(a.amount) >= Number(b.amount) ? a : b,
  );
  const label = top.parentCategoryName
    ? `${top.parentCategoryName}·${top.categoryName}`
    : top.categoryName;
  return items.length >= 2 ? `${label}等` : label;
}

export function createTransactionAmountSummary(
  currency: string,
): TransactionAmountSummary {
  return {
    balance: "0",
    currency,
    expense: "0",
    income: "0",
  };
}

export function addTransactionAmount(
  summary: TransactionAmountSummary,
  type: TransactionRecordType,
  amount: string,
) {
  if (type === "transfer") return;

  const value = Number(amount);

  if (!Number.isFinite(value)) return;

  if (type === "income") {
    summary.income = String(Number(summary.income) + value);
    summary.balance = String(Number(summary.balance) + value);
    return;
  }

  summary.expense = String(Number(summary.expense) + value);
  summary.balance = String(Number(summary.balance) - value);
}

export function normalizeMonth(month?: string | null) {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    return month;
  }

  const current = new Date();
  const year = current.getUTCFullYear();
  const monthValue = String(current.getUTCMonth() + 1).padStart(2, "0");

  return `${year}-${monthValue}`;
}

export function getMonthBounds(month: string) {
  const [yearText, monthText] = month.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0));

  return {
    endIso: end.toISOString(),
    startIso: start.toISOString(),
  };
}

export function shiftMonth(month: string, delta: number) {
  const [yearText, monthText] = month.split("-");
  const date = new Date(
    Date.UTC(Number(yearText), Number(monthText) - 1 + delta, 1),
  );
  const year = date.getUTCFullYear();
  const monthValue = String(date.getUTCMonth() + 1).padStart(2, "0");

  return `${year}-${monthValue}`;
}

export function formatMonthLabel(month: string) {
  const [yearText, monthText] = month.split("-");

  return `${yearText}年${Number(monthText)}月`;
}

export function formatDateKey(value: string) {
  return value.slice(0, 10);
}

export function formatDateLabel(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${month}/${day} ${weekDayLabels[date.getUTCDay()]}`;
}

export function getCurrentMonthRange() {
  const month = normalizeMonth();

  return {
    ...getMonthBounds(month),
    month,
    monthLabel: formatMonthLabel(month),
  };
}

export function groupTransactionItemsByDate(
  items: TransactionListItem[],
  currency: string,
): TransactionDateGroup[] {
  const groupByDate = new Map<string, TransactionDateGroup>();

  for (const item of items) {
    const dateKey = formatDateKey(item.transaction_at);
    const group = groupByDate.get(dateKey) ?? {
      date: dateKey,
      items: [],
      label: formatDateLabel(dateKey),
      summary: createTransactionAmountSummary(currency),
    };

    group.items.push(item);
    addTransactionAmount(group.summary, item.type, item.amount);
    groupByDate.set(dateKey, group);
  }

  return [...groupByDate.values()];
}

export function formatTransactionAt(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatTransactionTime(
  value: string,
  options: { timeZone?: string } = {},
) {
  return new Intl.DateTimeFormat(transactionTimeLocale, {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    timeZone: options.timeZone ?? serverFallbackTimeZone,
  }).format(new Date(value));
}

export function formatDateTimeLocalInputValue(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return `${date.getFullYear()}-${padDatePart(
    date.getMonth() + 1,
  )}-${padDatePart(date.getDate())}T${padDatePart(
    date.getHours(),
  )}:${padDatePart(date.getMinutes())}:${padDatePart(date.getSeconds())}`;
}

export function splitDateTimeLocalValue(value: string) {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}(?::\d{2})?)$/);

  if (!match) {
    return { date: "", time: "" };
  }

  return {
    date: match[1],
    time: normalizeTransactionTimeValue(match[2]),
  };
}

export function composeTransactionDateTimeLocalValue(
  date: string,
  time: string,
) {
  const normalizedTime = normalizeTransactionTimeValue(time);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !normalizedTime) {
    return "";
  }

  return `${date}T${normalizedTime}`;
}

function normalizeTransactionTimeValue(value: string) {
  if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value;

  return "";
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function getNowDateTimeLocalValue() {
  const current = new Date();

  return `${current.getFullYear()}-${padDatePart(
    current.getMonth() + 1,
  )}-${padDatePart(current.getDate())}T${padDatePart(
    current.getHours(),
  )}:${padDatePart(current.getMinutes())}:${padDatePart(current.getSeconds())}`;
}
