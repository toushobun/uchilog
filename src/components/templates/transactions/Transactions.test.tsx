import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  TransactionFilterOptions,
  TransactionFilters,
  TransactionGroupBy,
  TransactionGroupPage,
  TransactionMonthPage,
  TransactionTimeGroupViewData,
} from "types/transactions";
import { defaultTransactionFilters } from "types/transactions";
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
  vi.clearAllMocks();
});

const summary = {
  balance: "0",
  currency: "JPY",
  expense: "0",
  income: "0",
};

const timeGroupView: TransactionTimeGroupViewData = {
  groupBy: "month",
  groups: [
    {
      id: "month:2026-06",
      key: "2026-06",
      label: "2026年6月",
      summary,
      transactionCount: 0,
    },
  ],
  initialDateGroupsByGroupId: {},
  initialExpandedGroupId: null,
  initialNextItemOffsetByGroupId: {},
  nextOffset: null,
};

const filterOptions: TransactionFilterOptions = {
  accounts: [],
  categories: [],
  members: [],
  merchants: [],
  tags: [],
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

function buildGroupView(
  groupBy: TransactionGroupBy,
  label = groupBy === "merchant" ? "便利店" : "2026年6月",
): TransactionTimeGroupViewData {
  return {
    groupBy,
    groups: [
      {
        id: `${groupBy}:test`,
        key: "test",
        label,
        summary,
        transactionCount: 1,
      },
    ],
    initialDateGroupsByGroupId: {},
    initialExpandedGroupId: null,
    initialNextItemOffsetByGroupId: {},
    nextOffset: null,
  };
}

function buildEmptyGroupView(
  groupBy: TransactionGroupBy,
): TransactionTimeGroupViewData {
  return {
    groupBy,
    groups: [],
    initialDateGroupsByGroupId: {},
    initialExpandedGroupId: null,
    initialNextItemOffsetByGroupId: {},
    nextOffset: null,
  };
}

function renderPage({
  errorMessage = null,
  loadGroupViewAction,
}: {
  errorMessage?: string | null;
  loadGroupViewAction?: (
    groupBy: TransactionGroupBy,
    filters: TransactionFilters,
  ) => Promise<TransactionTimeGroupViewData>;
} = {}) {
  return render(
    <TransactionsTemplate
      errorMessage={errorMessage}
      filterOptions={filterOptions}
      loadGroupItemsAction={loadGroupItemsAction}
      loadGroupViewAction={loadGroupViewAction}
      loadMoreGroupsAction={loadMoreGroupsAction}
      timeGroupView={timeGroupView}
    />,
  );
}

function applyFilterDialog() {
  fireEvent.click(screen.getByRole("button", { name: "应用" }));
}

function openFilterDialog() {
  fireEvent.click(screen.getByRole("button", { name: "筛选" }));
}

function selectFilterOption(name: string) {
  fireEvent.click(screen.getByRole("button", { name }));
}

function createLoadGroupViewAction() {
  return vi.fn(async (groupBy: TransactionGroupBy) => buildGroupView(groupBy));
}

describe("TransactionsTemplate", () => {
  it("显示明细标题和入口", () => {
    const { container } = renderPage();

    expect(
      within(container).getByRole("heading", { name: "小票明细" }),
    ).toBeInTheDocument();
    expect(
      within(container).getByRole("button", { name: "搜索" }),
    ).toBeInTheDocument();
    expect(
      within(container).getByRole("button", { name: "筛选" }),
    ).toBeInTheDocument();
  });

  it("向时间分组列表传递当前分组", () => {
    const { container } = renderPage();

    expect(
      within(container).getByTestId("transaction-month-list"),
    ).toHaveTextContent("2026年6月");
  });

  it("传入错误信息时显示整页错误状态", () => {
    const { container } = renderPage({
      errorMessage: transactionListPageErrorMessages.voidFailed,
    });

    expect(within(container).getByText("明细读取失败")).toBeInTheDocument();
    expect(
      within(container).getByText(transactionListPageErrorMessages.voidFailed),
    ).toBeInTheDocument();
    expect(within(container).getByText("重新读取")).toBeInTheDocument();
    expect(
      within(container).queryByTestId("transaction-month-list"),
    ).toBeNull();
  });

  it("打开筛选弹框", () => {
    renderPage();

    openFilterDialog();

    expect(screen.getByRole("heading", { name: "筛选" })).toBeInTheDocument();
    expect(screen.getByText("显示方式")).toBeInTheDocument();
    expect(screen.getByText("筛选条件")).toBeInTheDocument();
  });

  it("切换按商家显示", async () => {
    const loadGroupViewAction = createLoadGroupViewAction();
    renderPage({ loadGroupViewAction });

    openFilterDialog();
    selectFilterOption("商家");
    applyFilterDialog();

    await waitFor(() => {
      expect(loadGroupViewAction).toHaveBeenCalledWith(
        "merchant",
        defaultTransactionFilters,
      );
      expect(screen.getByText("按商家显示")).toBeInTheDocument();
      expect(screen.getByTestId("transaction-month-list")).toHaveTextContent(
        "便利店",
      );
    });
  });

  it("普通筛选显示筛选结果如下", async () => {
    const loadGroupViewAction = createLoadGroupViewAction();
    renderPage({ loadGroupViewAction });

    openFilterDialog();
    selectFilterOption("支出");
    applyFilterDialog();

    await waitFor(() => {
      expect(loadGroupViewAction).toHaveBeenCalledWith("month", {
        recordType: "expense",
      });
      expect(screen.getByText("筛选结果如下")).toBeInTheDocument();
    });
  });

  it("筛选读取失败时在弹框内显示错误", async () => {
    const loadGroupViewAction = vi.fn(async () => {
      throw new Error("Failed to load filtered groups");
    });
    renderPage({ loadGroupViewAction });

    openFilterDialog();
    selectFilterOption("支出");
    applyFilterDialog();

    await waitFor(() => {
      expect(
        screen.getByText("筛选结果读取失败，请稍后重试。"),
      ).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "筛选" })).toBeInTheDocument();
      expect(screen.getByTestId("transaction-month-list")).toBeInTheDocument();
    });
  });

  it("筛选无结果时显示筛选空态", async () => {
    const loadGroupViewAction = vi.fn(async (groupBy: TransactionGroupBy) =>
      buildEmptyGroupView(groupBy),
    );
    renderPage({ loadGroupViewAction });

    openFilterDialog();
    selectFilterOption("支出");
    applyFilterDialog();

    await waitFor(() => {
      expect(loadGroupViewAction).toHaveBeenCalledWith("month", {
        recordType: "expense",
      });
      expect(screen.getByText("没有找到符合条件的流水。")).toBeInTheDocument();
      expect(screen.queryByText("还没有记账记录。")).toBeNull();
    });
  });

  it("分组加筛选显示组合提示", async () => {
    const loadGroupViewAction = createLoadGroupViewAction();
    renderPage({ loadGroupViewAction });

    openFilterDialog();
    selectFilterOption("商家");
    selectFilterOption("支出");
    applyFilterDialog();

    await waitFor(() => {
      expect(loadGroupViewAction).toHaveBeenCalledWith("merchant", {
        recordType: "expense",
      });
      expect(screen.getByText("按商家显示，筛选结果如下")).toBeInTheDocument();
    });
  });
});
