import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type {
  TransactionListItem,
  TransactionMonthPage,
  TransactionMonthView,
} from "types/transactions";
import { transactionListPageErrorMessages } from "utils/transactionMessages";

import { TransactionsTemplate } from "./Transactions";

type StoryCategoryItem = TransactionListItem["categoryItems"][number] & {
  specialLabel?: string;
  specialTone?: "blue" | "orange" | "pink" | "teal";
};

type StoryItemOptions = {
  accountName?: string;
  amount: string;
  categoryItems: StoryCategoryItem[];
  idSuffix: string;
  merchantName: string | null;
  note?: string | null;
  recorderName?: string | null;
  tagNames?: string[];
  time: string;
  type?: TransactionListItem["type"];
};

const today = startOfDay(new Date());
const yesterday = addDays(today, -1);
const oneWeekAgo = addDays(today, -7);

function createStoryItem({
  accountName = "三井住友银行",
  amount,
  categoryItems,
  idSuffix,
  merchantName,
  note = null,
  recorderName = "我",
  tagNames = [],
  time,
  type = "expense",
}: StoryItemOptions): TransactionListItem {
  return {
    account_currency: "JPY",
    account_name: accountName,
    amount,
    categoryItems,
    created_at: time,
    id: `00000000-0000-4000-8000-${idSuffix.padStart(12, "0")}`,
    merchant_icon_url: null,
    merchant_name: merchantName,
    note,
    recorder_name: recorderName,
    tagNames,
    transaction_at: time,
    type,
  } as TransactionListItem;
}

const monthView: TransactionMonthView = {
  month: formatMonth(today),
  monthLabel: formatMonthLabel(today),
  previousMonth: formatMonth(addMonths(today, -1)),
  nextMonth: formatMonth(addMonths(today, 1)),
  groups: [
    {
      date: formatDate(today),
      items: [
        createStoryItem({
          amount: "1980",
          categoryItems: [
            {
              amount: "680",
              categoryName: "咖啡",
              parentCategoryName: "饮食",
              specialLabel: "待报销",
              specialTone: "orange",
            },
            {
              amount: "980",
              categoryName: "午餐",
              parentCategoryName: "饮食",
            },
            {
              amount: "320",
              categoryName: "绘本",
              parentCategoryName: "玩耍",
              specialLabel: "待退款",
              specialTone: "blue",
            },
          ],
          idSuffix: "941001",
          merchantName: "松本清",
          tagNames: ["腐败", "日常", "孩子"],
          time: atTime(today, 9, 41),
        }),
        createStoryItem({
          amount: "2260",
          categoryItems: [
            {
              amount: "1360",
              categoryName: "甜点",
              parentCategoryName: "饮食",
            },
            {
              amount: "900",
              categoryName: "纸巾",
              parentCategoryName: "住房",
            },
          ],
          idSuffix: "941002",
          merchantName: "伊藤洋华堂",
          recorderName: "妻",
          tagNames: ["日常", "腐败"],
          time: atTime(today, 14, 15),
        }),
        createStoryItem({
          accountName: "三井住友银行",
          amount: "266330",
          categoryItems: [
            {
              amount: "266330",
              categoryName: "工资",
              parentCategoryName: "收入",
            },
          ],
          idSuffix: "941004",
          merchantName: "测试公司",
          recorderName: "我",
          tagNames: ["公司"],
          time: atTime(today, 10, 10),
          type: "income",
        }),
      ],
      label: "今天",
      summary: {
        balance: "262090",
        currency: "JPY",
        expense: "4240",
        income: "266330",
      },
    },
    {
      date: formatDate(yesterday),
      items: [
        createStoryItem({
          accountName: "现金",
          amount: "7930",
          categoryItems: [
            {
              amount: "7930",
              categoryName: "定期券",
              parentCategoryName: "出行",
              specialLabel: "待报销",
              specialTone: "orange",
            },
          ],
          idSuffix: "941003",
          merchantName: "近畿日本铁道",
          tagNames: ["公司", "日常"],
          time: atTime(yesterday, 9, 20),
        }),
      ],
      label: "昨天",
      summary: {
        balance: "-7930",
        currency: "JPY",
        expense: "7930",
        income: "0",
      },
    },
    {
      date: formatDate(oneWeekAgo),
      items: [
        createStoryItem({
          amount: "6340",
          categoryItems: [
            {
              amount: "4200",
              categoryName: "玩具",
              parentCategoryName: "玩耍",
            },
            {
              amount: "2140",
              categoryName: "晚餐",
              parentCategoryName: "饮食",
            },
          ],
          idSuffix: "941005",
          merchantName: "家附近商店",
          recorderName: "我",
          tagNames: ["孩子", "腐败"],
          time: atTime(oneWeekAgo, 18, 35),
        }),
      ],
      label: formatDateLabel(oneWeekAgo),
      summary: {
        balance: "-6340",
        currency: "JPY",
        expense: "6340",
        income: "0",
      },
    },
  ],
  nextOffset: null,
};

const emptyMonthView: TransactionMonthView = {
  ...monthView,
  groups: [],
};

async function loadMoreAction(): Promise<TransactionMonthPage> {
  return { groups: [], nextOffset: null };
}

function voidAction(formData: FormData) {
  console.info("void transaction", formData.get("transactionRecordId"));
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function atTime(date: Date, hours: number, minutes: number) {
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next.toISOString();
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonth(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatMonthLabel(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function formatDateLabel(date: Date) {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
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
  name: "小票明细页：今天 / 昨天 / 具体日期 / 收入",
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
    errorMessage: transactionListPageErrorMessages.voidFailed,
  },
};
