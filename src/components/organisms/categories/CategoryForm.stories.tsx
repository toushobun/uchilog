import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CategoryForm } from "./CategoryForm";

const meta = {
  title: "Organisms/Categories/CategoryForm",
  component: CategoryForm,
  args: {
    createCategoryAction: async () => {},
    parentOptions: [
      { id: "expense-food", name: "餐饮", type: "expense" },
      { id: "expense-transport", name: "交通", type: "expense" },
      { id: "income-main", name: "收入", type: "income" },
    ],
  },
} satisfies Meta<typeof CategoryForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "新增分类表单",
};

export const EmptyParentOptions: Story = {
  name: "没有上级分类候选",
  args: {
    parentOptions: [],
  },
};
