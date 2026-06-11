import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SettingsAccountsEntry } from "./SettingsAccountsEntry";

const meta: Meta<typeof SettingsAccountsEntry> = {
  component: SettingsAccountsEntry,
  title: "Molecules/Settings/AccountsEntry",
};

export default meta;
type Story = StoryObj<typeof SettingsAccountsEntry>;

export const Default: Story = {
  name: "账户管理入口",
};
