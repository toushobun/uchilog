import { cleanup, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  TransactionGroupPage,
  TransactionMonthPage,
  TransactionTimeGroupViewData,
} from "types/transactions";
import { transactionListPageErrorMessages } from "utils/transactionMessages";

import { TransactionsTemplate } from "./Transactions";

vi.mock("organisms/transactions/TransactionMonthList", () => ({
  TransactionMonthList: ({
    timeGroupView,
  }: {
    timeGroupView: TransactionTimeGroupViewData;
  }): ReactNode => (
    <div data-testid="transaction-month-list">
      {timeGroupView.groups.map((group) => group.label).join(" / ")}
    </div>
  ),
}));

afterEach(() => {
  cleanup();
});

const timeGroupView: TransactionTimeGroupViewData = {
  groupBy: "month",
  groups: [
    {
      id: "month:2026-06",
      key: "2026-06",
      label: "2026年6月",
      summary: {
        balance: "0",
        currency: "JPY",
        expense: "0",
        income: "0",
      },
      transactionCount: 0,
    },
  ],
  initialDateGroupsByGroupId: {},
  initialExpandedGroupId: null,
  initialNextItemOffsetByGroupId: {},
  nextOffset: null,
};

const loadGroupItemsAction = vi.fn(
  async (): Promise<TransactionMonthPage> => ({
    groups: [],
    nextOffset: null,
  }),
);

const loadMoreGroupsAction = vi.fn(
  async (): Promise<TransactionGroupPage> => ({
    groupBy: "month",
    groups: [],
    nextOffset: null,
  }),
);

function renderPage(errorMessage: string | null = null) {
  return render(
    <TransactionsTemplate
      errorMessage={errorMessage}
      loadGroupItemsAction={loadGroupItemsAction}
      loadMoreGroupsAction={loadMoreGroupsAction}
      timeGroupView={timeGroupView}
    />,
  );
}

describe("TransactionsTemplate", () => {
  it("显示明细标题", () => {
    const { container } = renderPage();

    expect(
      within(container).getByRole("heading", { name: "小票明细" }),
    ).toBeInTheDocument();
  });

  it("显示搜索和筛选图标入口", () => {
    const { container } = renderPage();

    expect(
      within(container).getByRole("button", { name: "搜索" }),
    ).toBeInTheDocument();
    expect(
      within(container).getByRole("button", { name: "筛选" }),
    ).toBeInTheDocument();
    expect(
      within(container).getByTestId("FilterAltOutlinedIcon"),
    ).toBeInTheDocument();
  });

  it("向时间分组列表传递当前分组", () => {
    const { container } = renderPage();

    expect(
      within(container).getByTestId("transaction-month-list"),
    ).toHaveTextContent("2026年6月");
  });

  it("传入错误信息时显示整页错误状态", () => {
    const { container } = renderPage(
      transactionListPageErrorMessages.voidFailed,
    );

    expect(within(container).getByText("明细读取失败")).toBeInTheDocument();
    expect(
      within(container).getByText(transactionListPageErrorMessages.voidFailed),
    ).toBeInTheDocument();
    expect(within(container).getByText("重新读取")).toBeInTheDocument();
    expect(
      within(container).queryByTestId("transaction-month-list"),
    ).toBeNull();
  });

  it("无错误信息时不显示错误提示", () => {
    const { container } = renderPage();

    expect(
      within(container).queryByText(
        transactionListPageErrorMessages.voidFailed,
      ),
    ).toBeNull();
  });
});
