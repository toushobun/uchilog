import { describe, expect, it } from "vitest";

import {
  createTransactionDateGroup,
  createTransactionListItem,
} from "@/test/mocks/transactions";

import { mergeTransactionDateGroups } from "./transactionMonthListUtils";

describe("mergeTransactionDateGroups", () => {
  it("合并同一天的新交易并重新计算增量汇总", () => {
    const result = mergeTransactionDateGroups(
      [
        createTransactionDateGroup({
          date: "2026-06-01",
          items: [
            createTransactionListItem({
              amount: "1000",
              categoryItems: [],
              id: "item-1",
            }),
          ],
          label: "2026-06-01",
        }),
      ],
      [
        createTransactionDateGroup({
          date: "2026-06-01",
          items: [
            createTransactionListItem({
              amount: "1000",
              categoryItems: [],
              id: "item-1",
            }),
            createTransactionListItem({
              amount: "2000",
              categoryItems: [],
              id: "item-2",
            }),
            createTransactionListItem({
              amount: "5000",
              categoryItems: [],
              id: "item-3",
              type: "income",
            }),
          ],
          label: "2026-06-01",
        }),
      ],
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.items.map((item) => item.id)).toEqual([
      "item-1",
      "item-2",
      "item-3",
    ]);
    expect(result[0]?.summary).toEqual({
      balance: "2000",
      currency: "JPY",
      expense: "3000",
      income: "5000",
    });
  });

  it("追加不同日期的分组", () => {
    const result = mergeTransactionDateGroups(
      [
        createTransactionDateGroup({
          date: "2026-06-01",
          items: [
            createTransactionListItem({
              amount: "1000",
              categoryItems: [],
              id: "item-1",
            }),
          ],
          label: "2026-06-01",
        }),
      ],
      [
        createTransactionDateGroup({
          date: "2026-06-02",
          items: [
            createTransactionListItem({
              amount: "2000",
              categoryItems: [],
              id: "item-2",
            }),
          ],
          label: "2026-06-02",
        }),
      ],
    );

    expect(result.map((group) => group.date)).toEqual([
      "2026-06-01",
      "2026-06-02",
    ]);
  });
});
