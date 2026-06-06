import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type {
  TransactionListItem,
  TransactionMonthView,
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
    account_name: index % 2 === 0 ? "日元现金" : "📘 Debit",
    amount,
    categoryItems: [
      {
        amount,
        categoryName: isExpense ? "餐饮" : "工资",
        parentCategoryName: isExpense ? "饮食" : null,
      },
    ],
    created_at: new Date(Date.UTC(2026, 4, 29, 3, 0, index)).toISOString(),
    id: `00000000-0000-4000-8000-${String(910000 + index).padStart(12, "0")}`,
    merchant_icon_url: null,
    merchant_name: isExpense ? "便利店" : "共達",
    note: index % 3 === 0 ? `Storybook 月度记录 #${index}` : null,
    recorder_name: null,
    transaction_at: new Date(
      Date.UTC(2026, 4, index <= 3 ? 29 : 28, 3 + index, 15, 0),
    ).toISOString(),
    type: isExpense ? "expense" : "income",
    ...overrides,
  };
}

const monthView: TransactionMonthView = {
  groups: [
    {
      date: "2026-05-29",
      items: [createItem(1), createItem(2), createItem(3)],
      label: "05/29 周五",
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
              parentCategoryName: null,
            },
          ],
          merchant_name: "共達",
          type: "income",
        }),
        createItem(5),
      ],
      label: "05/28 周四",
      summary: {
        balance: "258600",
        currency: "JPY",
        expense: "1400",
        income: "260000",
      },
    },
  ],
  month: "2026-05",
  monthLabel: "2026年5月",
  nextMonth: "2026-06",
  previousMonth: "2026-04",
  summary: {
    balance: "255480",
    currency: "JPY",
    expense: "4520",
    income: "260000",
  },
  nextOffset: null,
};

const emptyMonthView: TransactionMonthView = {
  ...monthView,
  groups: [],
  summary: {
    balance: "0",
    currency: "JPY",
    expense: "0",
    income: "0",
  },
};

function voidAction(formData: FormData) {
  console.info("void transaction", formData.get("transactionRecordId"));
}

const meta = {
  title: "Transactions/TransactionMonthList",
  component: TransactionMonthList,
  args: {
    monthView,
  },
} satisfies Meta<typeof TransactionMonthList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithVoidAction: Story = {
  args: {
    voidAction,
  },
};

export const Empty: Story = {
  args: {
    monthView: emptyMonthView,
  },
};
