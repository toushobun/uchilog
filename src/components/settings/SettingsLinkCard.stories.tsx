import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SettingsLinkCard } from "./SettingsLinkCard";

const meta = {
  title: "Settings/SettingsLinkCard",
  component: SettingsLinkCard,
  args: {
    buttonLabel: "打开账户管理",
    description: "管理当前账本的现金、银行卡、信用卡等账户，并可继续新增账户。",
    href: "/accounts",
    title: "账户管理",
  },
} satisfies Meta<typeof SettingsLinkCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AccountManagement: Story = {};
