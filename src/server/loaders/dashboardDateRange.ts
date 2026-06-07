import { formatMonthLabel } from "utils/transactions";

const jstOffsetMinutes = 9 * 60;
const minuteMs = 60 * 1000;

function getJstDateParts(value: Date) {
  const jstDate = new Date(value.getTime() + jstOffsetMinutes * minuteMs);

  return {
    day: jstDate.getUTCDate(),
    dayOfWeek: jstDate.getUTCDay(),
    monthIndex: jstDate.getUTCMonth(),
    year: jstDate.getUTCFullYear(),
  };
}

function createJstStartDateUtc(year: number, monthIndex: number, day: number) {
  return new Date(
    Date.UTC(year, monthIndex, day, 0, 0, 0) - jstOffsetMinutes * minuteMs,
  );
}

export function getDashboardDateRange(now = new Date()) {
  const { day, dayOfWeek, monthIndex, year } = getJstDateParts(now);
  const month = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const monthStart = createJstStartDateUtc(year, monthIndex, 1);
  const monthEnd = createJstStartDateUtc(year, monthIndex + 1, 1);
  const todayStart = createJstStartDateUtc(year, monthIndex, day);
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const weekStart = createJstStartDateUtc(
    year,
    monthIndex,
    day - daysSinceMonday,
  );

  return {
    month,
    monthEnd,
    monthEndIso: monthEnd.toISOString(),
    monthLabel: formatMonthLabel(month),
    monthStart,
    monthStartIso: monthStart.toISOString(),
    todayStart,
    todayStartIso: todayStart.toISOString(),
    weekStart,
    weekStartIso: weekStart.toISOString(),
  };
}
