import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type {
  TransactionListItem,
  TransactionListPage,
} from "types/transactions";

import { TransactionList } from "./TransactionList";

function createItem(index: number): TransactionListItem {
  const isExpense = index % 5 !== 0;
  const amount = String(isExpense ? 500 + index * 37 : 260000);

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
    created_at: new Date(Date.UTC(2026, 5, 5, 3, 0, index)).toISOString(),
    id: `00000000-0000-4000-8000-${String(900000 + index).padStart(12, "0")}`,
    merchant_icon_url: null,
    merchant_name: isExpense ? "便利店" : "共達",
    note: `Storybook 模拟记录 #${index}`,
    recorder_name: index % 3 === 0 ? "淞文" : null,
    tagNames: [],
    transaction_at: new Date(
      Date.UTC(2026, 5, 5 - index, 3, 0, 0),
    ).toISOString(),
    type: isExpense ? "expense" : "income",
  };
}

const firstPage: TransactionListPage = {
  items: Array.from({ length: 20 }, (_, index) => createItem(index + 1)),
  nextOffset: 20,
};

const emptyPage: TransactionListPage = {
  items: [],
  nextOffset: null,
};

async function loadMoreAction(offset: number): Promise<TransactionListPage> {
  return {
    items: Array.from({ length: 20 }, (_, index) =>
      createItem(offset + index + 1),
    ),
    nextOffset: offset >= 40 ? null : offset + 20,
  };
}

function voidAction(formData: FormData) {
  const transactionRecordId = formData.get("transactionRecordId");

  // Storybook 中只确认表单状态，不执行真实删除。
  console.info("void transaction", transactionRecordId);
}

const meta = {
  title: "Organisms/Transactions/TransactionList",
  component: TransactionList,
  args: {
    initialPage: firstPage,
    loadMoreAction,
  },
} satisfies Meta<typeof TransactionList>;

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
    initialPage: emptyPage,
  },
};

export const NoMoreRecords: Story = {
  args: {
    initialPage: {
      ...firstPage,
      nextOffset: null,
    },
  },
};
