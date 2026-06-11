import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LedgerSetupTemplate } from "./LedgerSetup";

const meta = {
  title: "Templates/LedgerSetup/LedgerSetupTemplate",
  component: LedgerSetupTemplate,
  args: {
    createLedgerAction: async () => {},
    errorMessage: null,
  },
} satisfies Meta<typeof LedgerSetupTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "初始化账本页面",
};

export const WithError: Story = {
  name: "含错误提示",
  args: {
    errorMessage: "账本创建失败。请稍后重试。",
  },
};
