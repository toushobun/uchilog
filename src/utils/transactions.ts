import { serverFallbackTimeZone, transactionTimeLocale } from "config/dateTime";
import type {
  CategorySummaryItem,
  TransactionAmountSummary,
  TransactionDateGroup,
  TransactionListItem,
  TransactionRecordType,
} from "types/transactions";
import { getCurrencySymbol } from "utils/currency";

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
  const formattedAmount = formatNumber(amount);
  const displayAmount = currency
    ? `${getCurrencySymbol(currency)} ${formattedAmount}`
    : formattedAmount;
  const amountValue = Number(amount);

  if (
    type === "transfer" ||
    (Number.isFinite(amountValue) && amountValue === 0)
  ) {
    return displayAmount;
  }

  return `${type === "expense" ? "-" : "+"} ${displayAmount}`;
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
  if (month && isMonthText(month)) {
    return month;
  }

  return getDateKeyInTimeZone(
    new Date().toISOString(),
    serverFallbackTimeZone,
  ).slice(0, 7);
}

export function getMonthBounds(month: string) {
  const [yearText, monthText] = month.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;

  return {
    endIso: getMonthStartUtcIso(year, monthIndex + 1, serverFallbackTimeZone),
    startIso: getMonthStartUtcIso(year, monthIndex, serverFallbackTimeZone),
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
  return getDateKeyInTimeZone(value, serverFallbackTimeZone);
}

export function formatDateLabel(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  const day = date.getUTCDate();
  const relativeLabel = getRelativeDateLabel(dateKey);

  return `${day}日（${relativeLabel ?? weekDayLabels[date.getUTCDay()]}）`;
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
  const [date = "", time = "", extra] = value.split("T");
  const normalizedTime = normalizeTransactionTimeValue(time);

  if (extra !== undefined || !isDateText(date) || !normalizedTime) {
    return { date: "", time: "" };
  }

  return {
    date,
    time: normalizedTime,
  };
}

export function composeTransactionDateTimeLocalValue(
  date: string,
  time: string,
) {
  const normalizedTime = normalizeTransactionTimeValue(time);

  if (!isDateText(date) || !normalizedTime) {
    return "";
  }

  return `${date}T${normalizedTime}`;
}

function getRelativeDateLabel(dateKey: string) {
  const current = new Date();
  const todayKey = getDateKeyFromParts(
    new Intl.DateTimeFormat(transactionTimeLocale, {
      day: "2-digit",
      month: "2-digit",
      timeZone: serverFallbackTimeZone,
      year: "numeric",
    }).formatToParts(current),
  );

  if (dateKey === todayKey) return "今天";
  if (dateKey === shiftDateKey(todayKey, -1)) return "昨天";
  if (dateKey === shiftDateKey(todayKey, 1)) return "明天";

  return null;
}

function getDateKeyFromParts(parts: Intl.DateTimeFormatPart[]) {
  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}

function shiftDateKey(dateKey: string, delta: number) {
  const [yearText, monthText, dayText] = dateKey.split("-");
  const date = new Date(
    Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText) + delta),
  );

  return `${date.getUTCFullYear()}-${padDatePart(
    date.getUTCMonth() + 1,
  )}-${padDatePart(date.getUTCDate())}`;
}

function normalizeTransactionTimeValue(value: string) {
  const parts = value.split(":");

  if (
    parts.length === 2 &&
    isFixedDigits(parts[0], 2) &&
    isFixedDigits(parts[1], 2)
  ) {
    return `${value}:00`;
  }

  if (
    parts.length === 3 &&
    isFixedDigits(parts[0], 2) &&
    isFixedDigits(parts[1], 2) &&
    isFixedDigits(parts[2], 2)
  ) {
    return value;
  }

  return "";
}

function isDateText(value: string) {
  const parts = value.split("-");

  return (
    parts.length === 3 &&
    isFixedDigits(parts[0], 4) &&
    isFixedDigits(parts[1], 2) &&
    isFixedDigits(parts[2], 2)
  );
}

function isMonthText(value: string) {
  const parts = value.split("-");

  return (
    parts.length === 2 &&
    isFixedDigits(parts[0], 4) &&
    isFixedDigits(parts[1], 2)
  );
}

function isFixedDigits(value: string | undefined, length: number) {
  if (value === undefined || value.length !== length) return false;

  return [...value].every(isDigit);
}

function isDigit(value: string) {
  return value >= "0" && value <= "9";
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function getDateKeyInTimeZone(
  isoString: string,
  timeZone: string,
): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(new Date(isoString));

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

function getMonthStartUtcIso(
  year: number,
  monthIndex: number,
  timeZone: string,
): string {
  // probe: UTC midnight on the 1st of the month (monthIndex may overflow, Date.UTC handles it)
  const probe = new Date(Date.UTC(year, monthIndex, 1));

  const localParts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(probe);

  const get = (type: string) =>
    Number(localParts.find((p) => p.type === type)?.value ?? "0");

  const localYear = get("year");
  const localMonth = get("month") - 1;
  const localDay = get("day");
  const localHour = get("hour") % 24;
  const localMinute = get("minute");

  // offset: naive-local-as-UTC minus actual-UTC
  const naiveLocalMs = Date.UTC(
    localYear,
    localMonth,
    localDay,
    localHour,
    localMinute,
  );
  const offsetMs = naiveLocalMs - probe.getTime();

  // local midnight on 1st expressed as UTC
  return new Date(Date.UTC(year, monthIndex, 1) - offsetMs).toISOString();
}

export function getNowDateTimeLocalValue() {
  const current = new Date();

  return `${current.getFullYear()}-${padDatePart(
    current.getMonth() + 1,
  )}-${padDatePart(current.getDate())}T${padDatePart(
    current.getHours(),
  )}:${padDatePart(current.getMinutes())}:${padDatePart(current.getSeconds())}`;
}
