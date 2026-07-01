import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type {
  TransactionGroupSummaryItem,
  TransactionListItem,
  TransactionTimeGroupViewData,
} from "types/transactions";

import { TransactionMonthList } from "./TransactionMonthList";

function createItem(
  index: number,
  overrides: Partial<TransactionListItem> = {},
): TransactionListItem {
  const isExpense = index % 4 !== 0;
  const amount = String(isExpense ? 800 + index * 120 : 120000);

  return {
    account_currency: "JPY",
    account_name: index % 2 === 0 ? "日元现金" : "Debit",
    amount,
    categoryItems: [
      {
        amount,
        categoryName: isExpense ? "餐饮" : "工资",
        categoryType: isExpense ? "expense" : "income",
        parentCategoryName: isExpense ? "饮食" : null,
      },
    ],
    created_at: new Date(Date.UTC(2026, 4, 29, 3, 0, index)).toISOString(),
    id: `00000000-0000-4000-8000-${String(910000 + index).padStart(12, "0")}`,
    merchant_icon_url: null,
    merchant_name: isExpense ? "便利店" : "共達",
    note: index % 3 === 0 ? `Storybook 月度记录 #${index}` : null,
    recorder_name: null,
    tagNames: [],
    transaction_at: new Date(
      Date.UTC(2026, 4, index <= 3 ? 29 : 28, 3 + index, 15, 0),
    ).toISOString(),
    type: isExpense ? "expense" : "income",
    ...overrides,
  };
}

const currentMonthGroup = createMonthGroup({
  balance: "-3120",
  expense: "3120",
  income: "0",
  key: "2026-05",
  label: "2026年5月",
  transactionCount: 3,
});
const previousMonthGroup = createMonthGroup({
  balance: "258600",
  expense: "1400",
  income: "260000",
  key: "2026-04",
  label: "2026年4月",
  transactionCount: 2,
});

const timeGroupView: TransactionTimeGroupViewData = {
  groupBy: "month",
  groups: [currentMonthGroup, previousMonthGroup],
  initialDateGroupsByGroupId: {
    [currentMonthGroup.id]: [
      {
        date: "2026-05-29",
        items: [createItem(1), createItem(2), createItem(3)],
        label: "29日（周五）",
        summary: {
          balance: "-3120",
          currency: "JPY",
          expense: "3120",
          income: "0",
        },
      },
      {
        date: "2026-05-28",
        items: [
          createItem(4, {
            amount: "260000",
            categoryItems: [
              {
                amount: "260000",
                categoryName: "工资",
                categoryType: "income",
                parentCategoryName: null,
              },
            ],
            merchant_name: "共達",
            type: "income",
          }),
          createItem(5),
        ],
        label: "28日（周四）",
        summary: {
          balance: "258600",
          currency: "JPY",
          expense: "1400",
          income: "260000",
        },
      },
    ],
  },
  initialExpandedGroupId: currentMonthGroup.id,
  initialNextItemOffsetByGroupId: {
    [currentMonthGroup.id]: null,
  },
  nextOffset: null,
};

const emptyTimeGroupView: TransactionTimeGroupViewData = {
  ...timeGroupView,
  groups: [],
  initialDateGroupsByGroupId: {},
  initialExpandedGroupId: null,
  initialNextItemOffsetByGroupId: {},
};

async function loadGroupItemsAction() {
  return { groups: [], nextOffset: null };
}

async function loadMoreGroupsAction() {
  return { groupBy: "month" as const, groups: [], nextOffset: null };
}

function createMonthGroup({
  balance,
  expense,
  income,
  key,
  label,
  transactionCount,
}: {
  balance: string;
  expense: string;
  income: string;
  key: string;
  label: string;
  transactionCount: number;
}): TransactionGroupSummaryItem {
  return {
    id: `month:${key}`,
    key,
    label,
    summary: {
      balance,
      currency: "JPY",
      expense,
      income,
    },
    transactionCount,
  };
}

const meta = {
  title: "Organisms/Transactions/TransactionMonthList",
  component: TransactionMonthList,
  args: {
    loadGroupItemsAction,
    loadMoreGroupsAction,
    timeGroupView,
  },
} satisfies Meta<typeof TransactionMonthList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    timeGroupView: emptyTimeGroupView,
  },
};
