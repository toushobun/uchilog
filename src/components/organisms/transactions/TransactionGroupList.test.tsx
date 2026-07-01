import { cleanup, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createTransactionDateGroup,
  createTransactionListItem,
} from "@/test/mocks/transactions";
import type { TransactionRowProps } from "molecules/transactions/TransactionRow";

import { TransactionGroupList } from "./TransactionGroupList";

vi.mock("molecules/transactions/TransactionRow", () => ({
  TransactionRow: ({ item }: TransactionRowProps): ReactNode => (
    <div data-testid={`row-${item.id}`}>
      {item.merchant_name ?? "未指定商家"}
    </div>
  ),
}));

afterEach(() => {
  cleanup();
});

const defaultGroup = createTransactionDateGroup({
  date: "2026-06-05",
  label: "5日（周五）",
});

describe("TransactionGroupList", () => {
  it("显示分组日期标签", () => {
    const { container } = render(
      <TransactionGroupList groups={[defaultGroup]} />,
    );

    expect(within(container).getByText("5日（周五）")).toBeInTheDocument();
  });

  it("显示分组内的记账记录", () => {
    const { container } = render(
      <TransactionGroupList groups={[defaultGroup]} />,
    );

    expect(
      within(container).getByTestId("row-00000000-0000-4000-8000-000000009001"),
    ).toBeInTheDocument();
  });

  it("记账记录本身直接链接到编辑页且不显示编辑按钮", () => {
    const { container } = render(
      <TransactionGroupList groups={[defaultGroup]} />,
    );

    expect(
      within(container).getByRole("link", { name: "便利店" }),
    ).toHaveAttribute(
      "href",
      "/transactions/00000000-0000-4000-8000-000000009001/edit",
    );
    expect(within(container).queryByRole("link", { name: "编辑" })).toBeNull();
    expect(
      within(container).queryByRole("button", { name: "删除" }),
    ).toBeNull();
  });

  it("显示多个分组", () => {
    const group2 = createTransactionDateGroup({
      date: "2026-06-01",
      label: "1日（周一）",
    });
    const { container } = render(
      <TransactionGroupList groups={[defaultGroup, group2]} />,
    );

    expect(within(container).getByText("5日（周五）")).toBeInTheDocument();
    expect(within(container).getByText("1日（周一）")).toBeInTheDocument();
  });

  it("显示分组支出汇总", () => {
    const { container } = render(
      <TransactionGroupList groups={[defaultGroup]} />,
    );

    expect(within(container).getByText("支出 ¥1,234")).toBeInTheDocument();
  });

  it("同一分组同时有收入和支出时显示收支与合计", () => {
    const mixedGroup = createTransactionDateGroup({
      items: [
        createTransactionListItem({
          amount: "3130",
          id: "00000000-0000-4000-8000-000000009002",
          type: "expense",
        }),
        createTransactionListItem({
          amount: "260000",
          categoryItems: [
            {
              amount: "260000",
              categoryName: "工资",
              parentCategoryName: "固定收入",
            },
          ],
          id: "00000000-0000-4000-8000-000000009003",
          merchant_name: "株式会社共达",
          type: "income",
        }),
      ],
    });
    const { container } = render(
      <TransactionGroupList groups={[mixedGroup]} />,
    );

    expect(
      within(container).getByText(
        "收入 ¥260,000 / 支出 ¥3,130 / 合计 +¥256,870",
      ),
    ).toBeInTheDocument();
  });
});
