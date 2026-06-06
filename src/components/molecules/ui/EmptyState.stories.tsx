import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmptyState } from "./EmptyState";

const meta: Meta<typeof EmptyState> = {
  component: EmptyState,
  title: "Molecules/UI/EmptyState",
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const MerchantListEmpty: Story = {
  name: "商家列表为空",
  args: {
    title: "还没有商家",
    description: "请先新增一个常用商家。",
  },
};

export const AccountListEmpty: Story = {
  name: "账户列表为空",
  args: {
    title: "还没有账户",
    description: "请先新增一个账户。",
  },
};
