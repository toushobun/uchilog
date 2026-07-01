import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CSSProperties } from "react";

import { getUserThemeCssVariables } from "theme/userThemeCssVariables";
import { userThemeKeys, userThemeTokens } from "theme/userThemeTokens";
import type {
  TransactionGroupPage,
  TransactionGroupSummaryItem,
  TransactionListItem,
  TransactionMonthPage,
  TransactionTimeGroupViewData,
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
const oneMonthAgo = addMonths(today, -1);

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

const currentMonthKey = formatMonth(today);
const previousMonthKey = formatMonth(oneMonthAgo);
const currentMonthGroup = createMonthGroup({
  balance: "262090",
  expense: "4240",
  income: "266330",
  key: currentMonthKey,
  label: formatMonthLabel(today),
  transactionCount: 3,
});
const previousMonthGroup = createMonthGroup({
  balance: "-14270",
  expense: "14270",
  income: "0",
  key: previousMonthKey,
  label: formatMonthLabel(oneMonthAgo),
  transactionCount: 2,
});

const currentMonthDateGroups = [
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
        note: "买完发现又忘了带优惠券",
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
    label: formatDateLabel(today),
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
        amount: "0",
        categoryItems: [
          {
            amount: "0",
            categoryName: "积分抵扣",
            parentCategoryName: "日常",
          },
        ],
        idSuffix: "941003",
        merchantName: null,
        tagNames: [],
        time: atTime(yesterday, 9, 20),
      }),
    ],
    label: formatDateLabel(yesterday),
    summary: {
      balance: "0",
      currency: "JPY",
      expense: "0",
      income: "0",
    },
  },
];

const previousMonthDateGroups = [
  {
    date: formatDate(oneMonthAgo),
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
        idSuffix: "951001",
        merchantName: "家附近商店",
        recorderName: "我",
        tagNames: ["孩子", "腐败"],
        time: atTime(oneMonthAgo, 18, 35),
      }),
      createStoryItem({
        accountName: "现金 → 三井住友银行",
        amount: "7930",
        categoryItems: [],
        idSuffix: "951002",
        merchantName: null,
        recorderName: "我",
        tagNames: [],
        time: atTime(oneMonthAgo, 20, 15),
        type: "transfer",
      }),
    ],
    label: formatDateLabel(oneMonthAgo),
    summary: {
      balance: "-6340",
      currency: "JPY",
      expense: "6340",
      income: "0",
    },
  },
];

const timeGroupView: TransactionTimeGroupViewData = {
  groupBy: "month",
  groups: [currentMonthGroup, previousMonthGroup],
  initialDateGroupsByGroupId: {
    [currentMonthGroup.id]: currentMonthDateGroups,
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

async function loadGroupItemsAction(
  groupKey: string,
): Promise<TransactionMonthPage> {
  if (groupKey === previousMonthKey) {
    return { groups: previousMonthDateGroups, nextOffset: null };
  }

  return { groups: currentMonthDateGroups, nextOffset: null };
}

async function loadMoreGroupsAction(): Promise<TransactionGroupPage> {
  return { groupBy: "month", groups: [], nextOffset: null };
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
  const weekDayLabels = [
    "周日",
    "周一",
    "周二",
    "周三",
    "周四",
    "周五",
    "周六",
  ];
  return `${date.getDate()}日（${weekDayLabels[date.getDay()]}）`;
}

function createThemePreviewStyle(themeKey: (typeof userThemeKeys)[number]) {
  return {
    ...(getUserThemeCssVariables(themeKey) as CSSProperties),
    background: "var(--user-theme-page-bg)",
    border: "1px solid var(--user-theme-card-border)",
    borderRadius: 24,
    minWidth: 360,
    overflow: "hidden",
    padding: 16,
  } satisfies CSSProperties;
}

const meta = {
  title: "Templates/Transactions/TransactionsTemplate",
  component: TransactionsTemplate,
  args: {
    errorMessage: null,
    loadGroupItemsAction,
    loadMoreGroupsAction,
    timeGroupView,
  },
} satisfies Meta<typeof TransactionsTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "小票明细页：按月分组 / 默认展开最新月",
};

export const Empty: Story = {
  name: "无流水",
  args: {
    timeGroupView: emptyTimeGroupView,
  },
};

export const Loading: Story = {
  name: "加载中",
  args: {
    isLoading: true,
  },
};

export const WithError: Story = {
  name: "首屏加载失败",
  args: {
    errorMessage: transactionListPageErrorMessages.voidFailed,
  },
};

export const MultiTheme: Story = {
  name: "六主题预览",
  render: (args) => (
    <div
      style={{
        display: "grid",
        gap: 24,
        gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
      }}
    >
      {userThemeKeys.map((themeKey) => (
        <section key={themeKey} style={createThemePreviewStyle(themeKey)}>
          <p
            style={{
              color: "var(--user-theme-section-text)",
              fontSize: 13,
              fontWeight: 900,
              margin: "0 0 12px",
            }}
          >
            {userThemeTokens[themeKey].name}
          </p>
          <TransactionsTemplate {...args} />
        </section>
      ))}
    </div>
  ),
};
