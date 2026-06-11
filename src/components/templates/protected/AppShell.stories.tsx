import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AppShell } from "./AppShell";

const meta = {
  title: "Templates/Protected/AppShell",
  component: AppShell,
  args: {
    email: "user@example.com",
    children: <div style={{ padding: 16 }}>页面内容区域</div>,
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "应用外壳（仪表盘）",
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/dashboard",
      },
    },
  },
};

export const TransactionsPage: Story = {
  name: "应用外壳（明细页）",
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/transactions",
      },
    },
  },
};

export const SettingsPage: Story = {
  name: "应用外壳（设置页）",
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/settings",
      },
    },
  },
};
