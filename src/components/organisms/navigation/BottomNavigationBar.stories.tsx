import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BottomNavigationBar } from "./BottomNavigationBar";

const meta = {
  title: "Organisms/Navigation/BottomNavigationBar",
  component: BottomNavigationBar,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/dashboard",
      },
    },
  },
} satisfies Meta<typeof BottomNavigationBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dashboard: Story = {
  name: "首页选中",
};

export const Transactions: Story = {
  name: "明细选中",
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/transactions",
      },
    },
  },
};

export const NewTransaction: Story = {
  name: "新增记录页（无选中）",
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/transactions/new",
      },
    },
  },
};
