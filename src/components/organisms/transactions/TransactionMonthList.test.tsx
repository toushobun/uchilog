import { cleanup, fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  TransactionDateGroup,
  TransactionGroupPage,
  TransactionGroupSummaryItem,
  TransactionListItem,
  TransactionMonthPage,
  TransactionTimeGroupViewData,
} from "types/transactions";

import { TransactionMonthList } from "./TransactionMonthList";

afterEach(() => {
  cleanup();
});

function createGroup(
  overrides: Partial<TransactionGroupSummaryItem>,
): TransactionGroupSummaryItem {
  return {
    id: "month:2026-06",
    key: "2026-06",
    label: "2026年6月",
    summary: {
      balance: "262090",
      currency: "JPY",
      expense: "4240",
      income: "266330",
    },
    transactionCount: 1,
    ...overrides,
  };
}

function createItem(
  overrides: Partial<TransactionListItem>,
): TransactionListItem {
  return {
    account_currency: "JPY",
    account_name: "现金",
    amount: "1200",
    categoryItems: [
      {
        amount: "1200",
        categoryName: "午餐",
        categoryType: "expense",
        parentCategoryName: "饮食",
      },
    ],
    created_at: "2026-06-01T09:00:00.000Z",
    id: "transaction-1",
    merchant_icon_url: null,
    merchant_name: "便利店",
    note: null,
    recorder_name: "成员",
    tagNames: [],
    transaction_at: "2026-06-01T09:00:00.000Z",
    type: "expense",
    ...overrides,
  };
}

function createDateGroup(
  overrides: Partial<TransactionDateGroup>,
): TransactionDateGroup {
  return {
    date: "2026-06-01",
    items: [createItem({})],
    label: "1日（周一）",
    summary: {
      balance: "-1200",
      currency: "JPY",
      expense: "1200",
      income: "0",
    },
    ...overrides,
  };
}

const emptyGroupPage: TransactionGroupPage = {
  groupBy: "month",
  groups: [],
  nextOffset: null,
};

const juneGroup = createGroup({ id: "month:2026-06", key: "2026-06" });
const mayGroup = createGroup({
  id: "month:2026-05",
  key: "2026-05",
  label: "2026年5月",
  summary: {
    balance: "-262090",
    currency: "JPY",
    expense: "266330",
    income: "4240",
  },
});
const juneDateGroups = [createDateGroup({})];
const mayDateGroups = [
  createDateGroup({
    date: "2026-05-02",
    items: [
      createItem({
        id: "transaction-2",
        merchant_name: "超市",
        transaction_at: "2026-05-02T10:00:00.000Z",
      }),
    ],
    label: "2日（周二）",
  }),
];

function createView(
  overrides: Partial<TransactionTimeGroupViewData> = {},
): TransactionTimeGroupViewData {
  return {
    groupBy: "month",
    groups: [juneGroup, mayGroup],
    initialDateGroupsByGroupId: {
      [juneGroup.id]: juneDateGroups,
    },
    initialExpandedGroupId: juneGroup.id,
    initialNextItemOffsetByGroupId: {
      [juneGroup.id]: null,
    },
    nextOffset: null,
    ...overrides,
  };
}

type IntersectionObserverCallback = (
  entries: IntersectionObserverEntry[],
) => void;

let capturedIntersectionCallbacks: IntersectionObserverCallback[] = [];

function setupIntersectionObserverMock() {
  capturedIntersectionCallbacks = [];

  class MockIntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      capturedIntersectionCallbacks.push(callback);
    }
    disconnect() {}
    observe() {}
    unobserve() {}
  }

  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
}

function triggerIntersection() {
  for (const cb of capturedIntersectionCallbacks) {
    cb([{ isIntersecting: true } as IntersectionObserverEntry]);
  }
}

describe("TransactionMonthList", () => {
  beforeEach(() => {
    setupIntersectionObserverMock();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("首次进入时默认展开第一条时间分组", () => {
    render(
      <TransactionMonthList
        loadGroupItemsAction={async () => ({ groups: [], nextOffset: null })}
        loadMoreGroupsAction={async () => emptyGroupPage}
        timeGroupView={createView()}
      />,
    );

    expect(screen.getByText("2026年6月")).toBeInTheDocument();
    expect(screen.getByText("1日（周一）")).toBeInTheDocument();
    expect(screen.getByText("便利店")).toBeInTheDocument();
    expect(screen.queryByText("2日（周二）")).toBeNull();
  });

  it("月份头部显示两行金额摘要且隐藏流水数量", () => {
    render(
      <TransactionMonthList
        loadGroupItemsAction={async () => ({ groups: [], nextOffset: null })}
        loadMoreGroupsAction={async () => emptyGroupPage}
        timeGroupView={createView()}
      />,
    );

    expect(screen.getAllByText("结余")).toHaveLength(2);
    expect(screen.getByText("¥262,090")).toBeInTheDocument();
    expect(screen.getByText("-¥262,090")).toBeInTheDocument();
    expect(screen.getAllByText("收入")).toHaveLength(2);
    expect(screen.getAllByText("¥266,330")).toHaveLength(2);
    expect(screen.getAllByText("支出")).toHaveLength(2);
    expect(screen.getAllByText("¥4,240")).toHaveLength(2);
    expect(screen.queryByText("1 条流水")).toBeNull();
  });

  it("允许同时展开多个时间分组", async () => {
    const loadGroupItemsAction = vi.fn(
      async (groupKey: string): Promise<TransactionMonthPage> => ({
        groups: groupKey === "2026-05" ? mayDateGroups : [],
        nextOffset: null,
      }),
    );

    render(
      <TransactionMonthList
        loadGroupItemsAction={loadGroupItemsAction}
        loadMoreGroupsAction={async () => emptyGroupPage}
        timeGroupView={createView()}
      />,
    );

    fireEvent.click(screen.getByText("2026年5月"));

    expect(await screen.findByText("2日（周二）")).toBeInTheDocument();
    expect(screen.getByText("1日（周一）")).toBeInTheDocument();
    expect(loadGroupItemsAction).toHaveBeenCalledWith("2026-05", 0);
  });

  it("sentinel 进入视口时调用 loadMoreGroupsAction 并追加新分组", async () => {
    const aprilGroup = createGroup({
      id: "month:2026-04",
      key: "2026-04",
      label: "2026年4月",
      summary: {
        balance: "0",
        currency: "JPY",
        expense: "0",
        income: "0",
      },
    });
    const loadMoreGroupsAction = vi.fn(
      async (): Promise<TransactionGroupPage> => ({
        groupBy: "month",
        groups: [aprilGroup],
        nextOffset: null,
      }),
    );

    render(
      <TransactionMonthList
        loadGroupItemsAction={async () => ({ groups: [], nextOffset: null })}
        loadMoreGroupsAction={loadMoreGroupsAction}
        timeGroupView={createView({ nextOffset: 2 })}
      />,
    );

    await act(async () => {
      triggerIntersection();
    });

    expect(loadMoreGroupsAction).toHaveBeenCalledWith(2);
    expect(await screen.findByText("2026年4月")).toBeInTheDocument();
  });

  it("展开尚未加载的分组时调用 loadGroupItemsAction(key, 0)", async () => {
    const loadGroupItemsAction = vi.fn(
      async (): Promise<TransactionMonthPage> => ({
        groups: [],
        nextOffset: null,
      }),
    );

    render(
      <TransactionMonthList
        loadGroupItemsAction={loadGroupItemsAction}
        loadMoreGroupsAction={async () => emptyGroupPage}
        timeGroupView={createView({
          initialDateGroupsByGroupId: {},
          initialExpandedGroupId: undefined,
        })}
      />,
    );

    fireEvent.click(screen.getByText("2026年6月"));

    expect(loadGroupItemsAction).toHaveBeenCalledWith("2026-06", 0);
  });

  it("分组内流水加载失败时显示局部错误和重试按钮，点击重试再次调用", async () => {
    const loadGroupItemsAction = vi
      .fn()
      .mockRejectedValue(new Error("load error"));

    // 初始不展开，点击后触发加载（并失败）
    render(
      <TransactionMonthList
        loadGroupItemsAction={loadGroupItemsAction}
        loadMoreGroupsAction={async () => emptyGroupPage}
        timeGroupView={createView({
          initialDateGroupsByGroupId: {},
          initialExpandedGroupId: undefined,
        })}
      />,
    );

    fireEvent.click(screen.getByText("2026年6月"));

    expect(
      await screen.findByText("分组内流水读取失败。"),
    ).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: "重试" });
    fireEvent.click(retryButton);

    expect(loadGroupItemsAction).toHaveBeenCalledTimes(2);
  });

  it("加载更多分组失败时显示局部错误和重试按钮", async () => {
    const loadMoreGroupsAction = vi
      .fn()
      .mockRejectedValue(new Error("load error"));

    render(
      <TransactionMonthList
        loadGroupItemsAction={async () => ({ groups: [], nextOffset: null })}
        loadMoreGroupsAction={loadMoreGroupsAction}
        timeGroupView={createView({ nextOffset: 2 })}
      />,
    );

    await act(async () => {
      triggerIntersection();
    });

    expect(await screen.findByText("更多分组读取失败。")).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: "重试" });
    fireEvent.click(retryButton);

    expect(loadMoreGroupsAction).toHaveBeenCalledTimes(2);
  });
});
