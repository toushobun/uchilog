import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { TransactionDateGroup } from "types/transactions";

import { TransactionGroupList } from "./TransactionGroupList";

const groups: TransactionDateGroup[] = [
  {
    date: "2026-06-05",
    label: "06/05 周五",
    summary: {
      currency: "JPY",
      income: "0",
      expense: "3120",
      balance: "-3120",
    },
    items: [
      {
        id: "00000000-0000-4000-8000-000000009001",
        type: "expense",
        transaction_at: "2026-06-05T03:20:10.000Z",
        amount: "1200",
        account_name: "日元现金",
        account_currency: "JPY",
        categoryItems: [
          { categoryName: "餐饮", parentCategoryName: "饮食", amount: "1200" },
        ],
        merchant_name: "便利店",
        merchant_icon_url: null,
        note: null,
        recorder_name: null,
        tagNames: [],
        created_at: "2026-06-05T03:20:10.000Z",
      },
    ],
  },
];

const meta = {
  title: "Organisms/Transactions/TransactionGroupList",
  component: TransactionGroupList,
  args: {
    groups,
  },
} satisfies Meta<typeof TransactionGroupList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "按日期分组的记账列表",
};

export const WithVoidAction: Story = {
  name: "带删除操作",
  args: {
    voidAction: (formData: FormData) => {
      console.info("void", formData.get("transactionRecordId"));
    },
  },
};
