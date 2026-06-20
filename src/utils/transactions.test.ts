import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TransactionListItem } from "types/transactions";

import {
  addTransactionAmount,
  composeTransactionDateTimeLocalValue,
  createTransactionAmountSummary,
  formatDateKey,
  formatDateLabel,
  formatDateTimeLocalInputValue,
  formatMonthLabel,
  formatNumber,
  formatPlainAmount,
  formatSignedNumber,
  formatTransactionAt,
  formatTransactionRowAmount,
  formatTransactionTime,
  getCategoryLabel,
  getCurrentMonthRange,
  getMonthBounds,
  getNowDateTimeLocalValue,
  groupTransactionItemsByDate,
  normalizeMonth,
  shiftMonth,
  splitDateTimeLocalValue,
} from "./transactions";

const numberFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

function createTransactionItem(
  overrides: Partial<TransactionListItem>,
): TransactionListItem {
  return {
    account_currency: "JPY",
    account_name: "現金",
    amount: "0",
    categoryItems: [],
    created_at: "2026-06-10T00:00:00.000Z",
    id: "transaction-id",
    merchant_icon_url: null,
    merchant_name: null,
    note: null,
    recorder_name: null,
    transaction_at: "2026-06-10T00:00:00.000Z",
    type: "expense",
    ...overrides,
  };
}

describe("transactions utils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("格式化金额字符串用于展示", () => {
    expect(formatNumber("1234.5")).toBe(numberFormatter.format(1234.5));
    expect(formatNumber("invalid")).toBe("invalid");
    expect(formatPlainAmount("1234.5", "JPY")).toBe(
      `${numberFormatter.format(1234.5)} JPY`,
    );
    expect(formatPlainAmount("1234.5")).toBe(numberFormatter.format(1234.5));
  });

  it("格式化带符号金额用于展示", () => {
    expect(formatSignedNumber("1200")).toBe(`+${numberFormatter.format(1200)}`);
    expect(formatSignedNumber("-1200")).toBe(
      `-${numberFormatter.format(1200)}`,
    );
    expect(formatSignedNumber("invalid")).toBe("invalid");
  });

  it("按交易类型给行金额添加符号", () => {
    expect(formatTransactionRowAmount("expense", "1200", "JPY")).toBe(
      `-${numberFormatter.format(1200)} JPY`,
    );
    expect(formatTransactionRowAmount("income", "1200", "JPY")).toBe(
      `+${numberFormatter.format(1200)} JPY`,
    );
  });

  it("从分类集计生成代表分类名", () => {
    expect(getCategoryLabel([])).toBeNull();
    expect(
      getCategoryLabel([
        {
          amount: "1200",
          categoryName: "外食",
          parentCategoryName: "食費",
        },
      ]),
    ).toBe("食費·外食");
    expect(
      getCategoryLabel([
        {
          amount: "1200",
          categoryName: "外食",
          parentCategoryName: "食費",
        },
        {
          amount: "3000",
          categoryName: "電車",
          parentCategoryName: "交通",
        },
      ]),
    ).toBe("交通·電車等");
  });

  it("按交易类型累计汇总金额", () => {
    const summary = createTransactionAmountSummary("JPY");

    addTransactionAmount(summary, "income", "5000");
    addTransactionAmount(summary, "expense", "1200");
    addTransactionAmount(summary, "expense", "invalid");

    expect(summary).toEqual({
      balance: "3800",
      currency: "JPY",
      expense: "1200",
      income: "5000",
    });
  });

  it("正则化月份字符串并返回 UTC ISO 月边界", () => {
    vi.setSystemTime(new Date("2026-06-10T03:04:05.000Z"));

    expect(normalizeMonth("2026-05")).toBe("2026-05");
    expect(normalizeMonth("2026-5")).toBe("2026-06");
    expect(normalizeMonth()).toBe("2026-06");
    expect(getMonthBounds("2024-02")).toEqual({
      endIso: "2024-03-01T00:00:00.000Z",
      startIso: "2024-02-01T00:00:00.000Z",
    });
  });

  it("生成月份移动结果和显示标签", () => {
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(formatMonthLabel("2026-06")).toBe("2026年6月");
  });

  it("生成日期 key 和日期标签", () => {
    expect(formatDateKey("2026-06-10T12:34:56.000Z")).toBe("2026-06-10");
    expect(formatDateLabel("2026-06-10")).toBe("06/10 周三");
  });

  it("格式化交易发生时间", () => {
    const value = "2026-06-10T01:02:03.000Z";
    const expected = new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
      month: "2-digit",
      second: "2-digit",
      year: "numeric",
    }).format(new Date(value));

    expect(formatTransactionAt(value)).toBe(expected);
  });

  it("格式化交易行时间为稳定的 24 小时制", () => {
    expect(formatTransactionTime("2026-06-10T01:02:03.000Z")).toBe("10:02");
    expect(
      formatTransactionTime("2026-06-10T01:02:03.000Z", {
        timeZone: "Asia/Shanghai",
      }),
    ).toBe("09:02");
  });

  it("按日期分组交易并生成日别汇总", () => {
    const groups = groupTransactionItemsByDate(
      [
        createTransactionItem({
          amount: "1200",
          id: "expense-1",
          transaction_at: "2026-06-10T01:00:00.000Z",
          type: "expense",
        }),
        createTransactionItem({
          amount: "5000",
          id: "income-1",
          transaction_at: "2026-06-10T02:00:00.000Z",
          type: "income",
        }),
        createTransactionItem({
          amount: "300",
          id: "expense-2",
          transaction_at: "2026-06-11T01:00:00.000Z",
          type: "expense",
        }),
      ],
      "JPY",
    );

    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({
      date: "2026-06-10",
      label: "06/10 周三",
      summary: {
        balance: "3800",
        currency: "JPY",
        expense: "1200",
        income: "5000",
      },
    });
    expect(groups[0].items.map((item) => item.id)).toEqual([
      "expense-1",
      "income-1",
    ]);
    expect(groups[1]).toMatchObject({
      date: "2026-06-11",
      summary: {
        balance: "-300",
        currency: "JPY",
        expense: "300",
        income: "0",
      },
    });
  });

  it("根据 UTC 当前时间生成当前月份范围", () => {
    vi.setSystemTime(new Date("2026-06-10T09:08:07.000Z"));

    expect(getCurrentMonthRange()).toEqual({
      endIso: "2026-07-01T00:00:00.000Z",
      month: "2026-06",
      monthLabel: "2026年6月",
      startIso: "2026-06-01T00:00:00.000Z",
    });
  });

  it("根据本地当前时间生成 datetime-local 当前值", () => {
    vi.setSystemTime(new Date(2026, 5, 10, 9, 8, 7));

    expect(getNowDateTimeLocalValue()).toBe("2026-06-10T09:08:07");
  });

  it("将 ISO 发生时间转换为本地日期时间输入值", () => {
    const value = "2026-06-05T03:20:10.000Z";
    const date = new Date(value);
    const pad = (part: number) => String(part).padStart(2, "0");

    expect(formatDateTimeLocalInputValue(value)).toBe(
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate(),
      )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
        date.getSeconds(),
      )}`,
    );
    expect(formatDateTimeLocalInputValue("invalid")).toBe("invalid");
  });

  it("拆分并组合本地日期时间值", () => {
    expect(splitDateTimeLocalValue("2026-06-10T09:08:07")).toEqual({
      date: "2026-06-10",
      time: "09:08:07",
    });
    expect(splitDateTimeLocalValue("2026-06-10T09:08")).toEqual({
      date: "2026-06-10",
      time: "09:08:00",
    });
    expect(splitDateTimeLocalValue("invalid")).toEqual({ date: "", time: "" });
    expect(composeTransactionDateTimeLocalValue("2026-06-10", "09:08")).toBe(
      "2026-06-10T09:08:00",
    );
    expect(composeTransactionDateTimeLocalValue("2026-06-10", "09:08:07")).toBe(
      "2026-06-10T09:08:07",
    );
    expect(composeTransactionDateTimeLocalValue("invalid", "09:08")).toBe("");
  });
});
