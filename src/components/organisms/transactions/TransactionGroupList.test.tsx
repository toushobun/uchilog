import { cleanup, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createTransactionDateGroup } from "@/test/mocks/transactions";

import { TransactionGroupList } from "./TransactionGroupList";

vi.mock("molecules/transactions/TransactionRow", () => ({
  TransactionRow: ({
    item,
  }: {
    item: { id: string; merchant_name: string | null };
  }): ReactNode => (
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
  label: "06/05 周五",
});

describe("TransactionGroupList", () => {
  it("显示分组日期标签", () => {
    const { container } = render(
      <TransactionGroupList groups={[defaultGroup]} />,
    );

    expect(within(container).getByText("06/05 周五")).toBeTruthy();
  });

  it("显示分组内的记账记录", () => {
    const { container } = render(
      <TransactionGroupList groups={[defaultGroup]} />,
    );

    expect(
      within(container).getByTestId("row-00000000-0000-4000-8000-000000009001"),
    ).toBeTruthy();
  });

  it("显示多个分组", () => {
    const group2 = createTransactionDateGroup({
      date: "2026-06-01",
      label: "06/01 周一",
    });
    const { container } = render(
      <TransactionGroupList groups={[defaultGroup, group2]} />,
    );

    expect(within(container).getByText("06/05 周五")).toBeTruthy();
    expect(within(container).getByText("06/01 周一")).toBeTruthy();
  });

  it("分组汇总结余为负数时金额有对应样式标识", () => {
    const { container } = render(
      <TransactionGroupList groups={[defaultGroup]} />,
    );

    expect(within(container).getByText("-1,234")).toBeTruthy();
  });
});
