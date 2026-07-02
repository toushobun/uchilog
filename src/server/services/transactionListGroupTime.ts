import { serverFallbackTimeZone } from "config/dateTime";
import type { TransactionGroupBy } from "types/transactions";
import { getDateKeyInTimeZone } from "utils/transactions";

export const timeGroupByValues = [
  "year",
  "quarter",
  "month",
  "week",
  "day",
] as const;

export type TransactionTimeGroupBy = (typeof timeGroupByValues)[number];

export function isTransactionTimeGroupBy(
  groupBy: TransactionGroupBy,
): groupBy is TransactionTimeGroupBy {
  return timeGroupByValues.includes(
    groupBy as (typeof timeGroupByValues)[number],
  );
}

export function getTransactionTimeGroupInfo(
  groupBy: TransactionTimeGroupBy,
  transactionAt: string,
) {
  const dateKey = getDateKeyInTimeZone(transactionAt, serverFallbackTimeZone);
  const [yearText, monthText, dayText] = dateKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (groupBy === "year") {
    return { key: String(year), label: `${year}年` };
  }

  if (groupBy === "quarter") {
    const quarter = Math.floor((month - 1) / 3) + 1;
    return { key: `${year}-Q${quarter}`, label: `${year}年第${quarter}季度` };
  }

  if (groupBy === "month") {
    const monthKey = String(month).padStart(2, "0");
    return { key: `${year}-${monthKey}`, label: `${year}年${month}月` };
  }

  if (groupBy === "week") {
    const weekStartKey = getWeekStartDateKey(dateKey);
    const [wy, wm, wd] = weekStartKey.split("-").map(Number);
    return {
      key: weekStartKey,
      label: `${wy}年${wm}月${wd}日周`,
    };
  }

  const dayKey = [
    String(year),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");

  return {
    key: dayKey,
    label: `${year}年${month}月${day}日`,
  };
}

function getWeekStartDateKey(dateKey: string): string {
  const [yearText, monthText, dayText] = dateKey.split("-");
  const date = new Date(
    Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText)),
  );
  const day = date.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(date.getTime() + mondayOffset * 86400000);
  const month = String(start.getUTCMonth() + 1).padStart(2, "0");
  const startDate = String(start.getUTCDate()).padStart(2, "0");

  return `${start.getUTCFullYear()}-${month}-${startDate}`;
}
