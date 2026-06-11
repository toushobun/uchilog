import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type {
  TransactionListItem,
  TransactionMonthPage,
  TransactionMonthView,
} from "types/transactions";

import { TransactionsTemplate } from "./Transactions";

function createItem(index: number): TransactionListItem {
  const isExpense = index % 4 !== 0;
  const amount = String(isExpense ? 800 + index * 120 : 120000);

  return {
    account_currency: "JPY",
    account_name: "日元现金",
    amount,
    categoryItems: [
      {
        amount,
        categoryName: isExpense ? "餐饮" : "工资",
        parentCategoryName: isExpense ? "饮食" : null,
      },
    ],
    created_at: new Date(Date.UTC(2026, 5, 5, 3, 0, index)).toISOString(),
    id: `00000000-0000-4000-8000-${String(920000 + index).padStart(12, "0")}`,
    merchant_icon_url: null,
    merchant_name: isExpense ? "便利店" : "共達",
    note: null,
    recorder_name: null,
    transaction_at: new Date(
      Date.UTC(2026, 5, 5, 3 + index, 0, 0),
    ).toISOString(),
    type: isExpense ? "expense" : "income",
  };
}

const monthView: TransactionMonthView = {
  month: "2026-06",
  monthLabel: "2026年6月",
  previousMonth: "2026-05",
  nextMonth: "2026-07",
  summary: {
    balance: "255480",
    currency: "JPY",
    expense: "4520",
    income: "260000",
  },
  groups: [
    {
      date: "2026-06-05",
      items: [createItem(1), createItem(2), createItem(3)],
      label: "06/05 周五",
      summary: {
        balance: "-3120",
        currency: "JPY",
        expense: "3120",
        income: "0",
      },
    },
    {
      date: "2026-06-01",
      items: [createItem(4), createItem(5)],
      label: "06/01 周一",
      summary: {
        balance: "118600",
        currency: "JPY",
        expense: "1400",
        income: "120000",
      },
    },
  ],
  nextOffset: null,
};

const emptyMonthView: TransactionMonthView = {
  ...monthView,
  groups: [],
  summary: { balance: "0", currency: "JPY", expense: "0", income: "0" },
};

async function loadMoreAction(): Promise<TransactionMonthPage> {
  return { groups: [], nextOffset: null };
}

function voidAction(formData: FormData) {
  console.info("void transaction", formData.get("transactionRecordId"));
}

const meta = {
  title: "Templates/Transactions/TransactionsTemplate",
  component: TransactionsTemplate,
  args: {
    monthView,
    errorMessage: null,
    loadMoreAction,
    voidAction,
  },
} satisfies Meta<typeof TransactionsTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "记账明细页",
};

export const Empty: Story = {
  name: "本月无记录",
  args: {
    monthView: emptyMonthView,
  },
};

export const WithError: Story = {
  name: "含错误提示",
  args: {
    errorMessage: "记录删除失败。请稍后重试。",
  },
};
