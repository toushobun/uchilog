import { transactionDateTimePickerMessages as messages } from "@/constants/transactions";

export type CalendarDay = {
  date: Date;
  value: string;
};

export type MonthSlideDirection = -1 | 0 | 1;

export type TimeParts = {
  hour: number;
  minute: number;
  second: number;
};

export function buildCalendarDays(visibleMonth: Date): (CalendarDay | null)[] {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const dayCount = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((firstWeekday + dayCount) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    const day = index - firstWeekday + 1;
    if (day < 1 || day > dayCount) return null;

    const date = new Date(year, month, day);
    return { date, value: formatDateValue(date) };
  });
}

export function formatAccessibleDate(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export function formatDateTimeLabel(date: string, time: string, today: string) {
  const parsedDate = parseDateValue(date);

  if (!parsedDate) return "请选择日期";

  const dateLabel =
    date === today
      ? `${messages.today} ${pad(parsedDate.getMonth() + 1)}月${pad(
          parsedDate.getDate(),
        )}日`
      : `${parsedDate.getFullYear()}年${pad(
          parsedDate.getMonth() + 1,
        )}月${pad(parsedDate.getDate())}日`;

  return `${dateLabel} ${formatTimeDisplay(time)}`;
}

export function formatDateValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
}

export function formatFullDateLabel(value: string) {
  const date = parseDateValue(value);
  if (!date) return value;

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 星期${"日一二三四五六"[date.getDay()]}`;
}

export function formatTimeDisplay(value: string) {
  const parts = splitTimeValue(value);

  return `${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`;
}

export function getMonthStart(value: string) {
  const date = parseDateValue(value) ?? new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function parseDateValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function splitTimeValue(value: string): TimeParts {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);

  return {
    hour: normalizeTimePart(match?.[1], 0, 23),
    minute: normalizeTimePart(match?.[2], 0, 59),
    second: normalizeTimePart(match?.[3], 0, 59),
  };
}

function normalizeTimePart(
  value: string | undefined,
  min: number,
  max: number,
) {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue)) return 0;

  return Math.min(max, Math.max(min, numericValue));
}

export function pad(value: number) {
  return String(value).padStart(2, "0");
}
