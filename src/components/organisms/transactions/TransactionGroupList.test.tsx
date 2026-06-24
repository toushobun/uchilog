import { cleanup, fireEvent, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createTransactionDateGroup } from "@/test/mocks/transactions";
import type { TransactionRowProps } from "molecules/transactions/TransactionRow";

import { TransactionGroupList } from "./TransactionGroupList";

vi.mock("molecules/transactions/TransactionRow", () => ({
  TransactionRow: ({ item, showEdit }: TransactionRowProps): ReactNode => (
    <div
      data-show-edit={showEdit ? "true" : "false"}
      data-testid={`row-${item.id}`}
    >
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

    expect(within(container).getByText("06/05 周五")).toBeInTheDocument();
  });

  it("显示分组内的记账记录", () => {
    const { container } = render(
      <TransactionGroupList groups={[defaultGroup]} />,
    );

    expect(
      within(container).getByTestId("row-00000000-0000-4000-8000-000000009001"),
    ).toBeInTheDocument();
  });

  it("点击记账记录后显示编辑和删除入口", () => {
    const { container } = render(
      <TransactionGroupList groups={[defaultGroup]} voidAction={vi.fn()} />,
    );

    fireEvent.click(
      within(container).getByTestId("row-00000000-0000-4000-8000-000000009001"),
    );

    expect(
      within(container).getByRole("link", { name: "编辑" }),
    ).toBeInTheDocument();
    expect(
      within(container).getByRole("button", { name: "删除" }),
    ).toBeInTheDocument();
  });

  it("显示多个分组", () => {
    const group2 = createTransactionDateGroup({
      date: "2026-06-01",
      label: "06/01 周一",
    });
    const { container } = render(
      <TransactionGroupList groups={[defaultGroup, group2]} />,
    );

    expect(within(container).getByText("06/05 周五")).toBeInTheDocument();
    expect(within(container).getByText("06/01 周一")).toBeInTheDocument();
  });

  it("显示分组支出汇总", () => {
    const { container } = render(
      <TransactionGroupList groups={[defaultGroup]} />,
    );

    expect(within(container).getByText("支出 ¥1,234")).toBeInTheDocument();
  });
});
