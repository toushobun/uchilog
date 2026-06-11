import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CategoryList } from "./CategoryList";

const categories = [
  {
    children: [
      {
        created_at: "2026-01-01T00:00:00.000Z",
        id: "expense-child-food",
        name: "外食",
        parent_id: "expense-food",
        sort_order: 10,
        type: "expense" as const,
      },
      {
        created_at: "2026-01-01T00:00:00.000Z",
        id: "expense-child-cafe",
        name: "咖啡",
        parent_id: "expense-food",
        sort_order: 20,
        type: "expense" as const,
      },
    ],
    created_at: "2026-01-01T00:00:00.000Z",
    id: "expense-food",
    name: "餐饮",
    parent_id: null,
    sort_order: 10,
    type: "expense" as const,
  },
  {
    children: [
      {
        created_at: "2026-01-01T00:00:00.000Z",
        id: "income-child-salary",
        name: "固定工资",
        parent_id: "income-salary",
        sort_order: 10,
        type: "income" as const,
      },
    ],
    created_at: "2026-01-01T00:00:00.000Z",
    id: "income-salary",
    name: "工资",
    parent_id: null,
    sort_order: 10,
    type: "income" as const,
  },
];

const meta = {
  title: "Organisms/Categories/CategoryList",
  component: CategoryList,
  args: {
    archiveCategoryAction: async () => {},
    categories,
    errorCategoryId: null,
    errorMessage: null,
    updateCategoryAction: async () => {},
  },
} satisfies Meta<typeof CategoryList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "分类列表",
};

export const Empty: Story = {
  name: "空状态",
  args: {
    categories: [],
  },
};

export const WithError: Story = {
  name: "带错误提示",
  args: {
    errorCategoryId: "expense-food",
    errorMessage: "分类归档失败。",
  },
};
