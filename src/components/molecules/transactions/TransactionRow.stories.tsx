import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { TransactionRowItem } from "types/transactions";

import { TransactionRow } from "./TransactionRow";

// seed 9001: 業務スーパー 2026-06-05, expense, 2858 JPY, 4 categories
const expenseItem: TransactionRowItem & {
  tagItems?: { name: string; color: string }[];
} = {
  id: "00000000-0000-4000-8000-000000009001",
  type: "expense",
  transaction_at: "2026-06-05T10:30:00.000Z",
  amount: "2858",
  account_name: "💴 日元现金",
  account_currency: "JPY",
  categoryItems: [
    {
      amount: "1280",
      categoryName: "🥬 做饭食材/调料",
      parentCategoryName: "🍽️ 饮食",
      categoryType: "expense",
    },
    {
      amount: "498",
      categoryName: "🧃 饮料",
      parentCategoryName: "🍽️ 饮食",
      categoryType: "expense",
    },
    {
      amount: "324",
      categoryName: "🍿 零食",
      parentCategoryName: "🍽️ 饮食",
      categoryType: "expense",
    },
    {
      amount: "756",
      categoryName: "🧴 日常用品",
      parentCategoryName: "🏠 生活用品",
      categoryType: "expense",
    },
  ],
  merchant_name: "業務スーパー",
  merchant_icon_url: null,
  note: "猪肉・鸡腿・蔬菜",
  recorder_name: "淞文",
  tagNames: [],
  tagItems: [{ name: "日常", color: "#DBEAFE" }],
};

// seed 9016: 株式会社共逹 2026-06-01, income, 323000 JPY, 4 categories
const incomeItem: TransactionRowItem = {
  id: "00000000-0000-4000-8000-000000009016",
  type: "income",
  transaction_at: "2026-06-01T00:00:00.000Z",
  amount: "323000",
  account_name: "💴 日元现金",
  account_currency: "JPY",
  categoryItems: [
    {
      amount: "280000",
      categoryName: "💴 工资",
      parentCategoryName: "💰 工资收入",
      categoryType: "income",
    },
    {
      amount: "15000",
      categoryName: "💼 职务手当",
      parentCategoryName: "💰 工资收入",
      categoryType: "income",
    },
    {
      amount: "20000",
      categoryName: "🏠 住房手当",
      parentCategoryName: "💰 工资收入",
      categoryType: "income",
    },
    {
      amount: "8000",
      categoryName: "🚃 通勤手当",
      parentCategoryName: "💰 工资收入",
      categoryType: "income",
    },
  ],
  merchant_name: "株式会社共逹",
  merchant_icon_url: null,
  note: null,
  recorder_name: null,
  tagNames: [],
};

const transferItem: TransactionRowItem = {
  id: "00000000-0000-4000-8000-000000009003",
  type: "transfer",
  transaction_at: "2026-06-02T12:54:00.000Z",
  amount: "50000",
  account_name: "💴 日元现金 → 🏦 储蓄账户",
  account_currency: "JPY",
  categoryItems: [],
  merchant_name: null,
  merchant_icon_url: null,
  note: null,
  recorder_name: "淞文",
  tagNames: [],
};

const meta = {
  title: "Molecules/Transactions/TransactionRow",
  component: TransactionRow,
  decorators: [
    (Story) => (
      <Box sx={{ bgcolor: "common.white", minHeight: "100vh" }}>
        <Story />
      </Box>
    ),
  ],
  args: {
    item: expenseItem,
    receiptCard: true,
    showAccount: true,
    showRecorder: true,
    showTime: true,
  },
} satisfies Meta<typeof TransactionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ExpenseFull: Story = {
  name: "普通支出",
};

export const Income: Story = {
  name: "收入记录",
  args: {
    item: incomeItem,
  },
};

export const Transfer: Story = {
  name: "转账记录",
  args: {
    item: transferItem,
  },
};

export const MultipleTags: Story = {
  name: "多标签",
  args: {
    item: {
      ...expenseItem,
      tagItems: [
        { name: "日常", color: "#DBEAFE" },
        { name: "孩子", color: "#FCE7F3" },
        { name: "公司", color: "#D1FAE5" },
        { name: "旅行", color: "#FEF3C7" },
        { name: "外食", color: "#FEE2E2" },
      ],
    } as TransactionRowItem,
  },
};

export const ManyTags: Story = {
  name: "标签特别多",
  args: {
    item: {
      ...expenseItem,
      tagItems: [
        { name: "日常", color: "#DBEAFE" },
        { name: "孩子", color: "#FCE7F3" },
        { name: "公司", color: "#D1FAE5" },
        { name: "腐败", color: "#FEF3C7" },
        { name: "旅行", color: "#FEE2E2" },
        { name: "猫粮", color: "#EDE9FE" },
        { name: "外食", color: "#ECFDF5" },
        { name: "药局", color: "#FFF7ED" },
        { name: "交通", color: "#EFF6FF" },
        { name: "长标签名称测试", color: "#F0FDF4" },
      ],
    } as TransactionRowItem,
  },
};

export const NoMetaRow: Story = {
  name: "第二行全部为空",
  args: {
    item: {
      ...expenseItem,
      recorder_name: null,
      tagNames: [],
    },
    showAccount: false,
    showRecorder: false,
    showTime: false,
  },
};

export const NoMerchant: Story = {
  name: "无商家",
  args: {
    item: {
      ...expenseItem,
      merchant_name: null,
      merchant_icon_url: null,
    },
  },
};

export const ZeroAmount: Story = {
  name: "金额为 0",
  args: {
    item: {
      ...expenseItem,
      amount: "0",
      categoryItems: [
        {
          amount: "0",
          categoryName: "💸 金额调整",
          parentCategoryName: "📋 其他",
          categoryType: "expense",
        },
      ],
    },
  },
};

export const FutureDate: Story = {
  name: "未来日期",
  args: {
    item: {
      ...expenseItem,
      transaction_at: "2026-12-31T14:30:00.000Z",
    },
  },
};

export const TwoCategories: Story = {
  name: "小分类 2 项",
  args: {
    item: {
      ...expenseItem,
      amount: "656",
      categoryItems: [
        {
          amount: "498",
          categoryName: "🍱 便当",
          parentCategoryName: "🍽️ 饮食",
          categoryType: "expense",
        },
        {
          amount: "158",
          categoryName: "🧃 饮料",
          parentCategoryName: "🍽️ 饮食",
          categoryType: "expense",
        },
      ],
    },
  },
};

export const ThreeCategories: Story = {
  name: "小分类 3 项",
  args: {
    item: {
      ...expenseItem,
      amount: "1162",
      categoryItems: [
        {
          amount: "645",
          categoryName: "🥬 做饭食材/调料",
          parentCategoryName: "🍽️ 饮食",
          categoryType: "expense",
        },
        {
          amount: "328",
          categoryName: "🍎 水果",
          parentCategoryName: "🍽️ 饮食",
          categoryType: "expense",
        },
        {
          amount: "189",
          categoryName: "🍿 零食",
          parentCategoryName: "🍽️ 饮食",
          categoryType: "expense",
        },
      ],
    },
  },
};

export const ManyExpenseCategories: Story = {
  name: "小分类 4 项以上（净支出）",
  args: {
    item: {
      ...expenseItem,
    },
  },
};

export const MixedIncomeNet: Story = {
  name: "混合收支（净收入）",
  args: {
    item: {
      ...incomeItem,
      amount: "278800",
      categoryItems: [
        {
          amount: "1200",
          categoryName: "🍜 外食",
          parentCategoryName: "🍽️ 饮食",
          categoryType: "expense",
        },
        {
          amount: "280000",
          categoryName: "💴 工资",
          parentCategoryName: "💰 工资收入",
          categoryType: "income",
        },
      ],
    },
  },
};

export const ManyIncomeCategories: Story = {
  name: "小分类 4 项以上（净收入）",
  args: {
    item: {
      ...incomeItem,
    },
  },
};

export const LongText: Story = {
  name: "长商家名 / 长备注 / 长标签",
  args: {
    item: {
      ...expenseItem,
      merchant_name:
        "非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常长的商家名称便利店",
      note: "这是一条非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常长的备注内容",
      tagItems: [
        { name: "非常长的标签名称会被截断", color: "#DBEAFE" },
        { name: "日常", color: "#FCE7F3" },
      ],
    } as TransactionRowItem,
  },
};
