import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  createMerchantAliasRow,
  createMerchantRow,
} from "@/test/mocks/merchants";

import { MerchantCard } from "./MerchantCard";

const merchant = createMerchantRow({
  aliases: [
    createMerchantAliasRow(),
    createMerchantAliasRow({ alias: "LIFE", id: "alias-2", sort_order: 2 }),
  ],
  note: "常去的超市",
});

const meta = {
  title: "Organisms/Merchants/MerchantCard",
  component: MerchantCard,
  args: {
    archiveAliasAction: async () => {},
    archiveMerchantAction: async () => {},
    createAliasAction: async () => {},
    errorMessage: null,
    merchant,
    updateMerchantAction: async () => {},
  },
} satisfies Meta<typeof MerchantCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "商家卡片",
};

export const WithoutAliases: Story = {
  name: "无别名",
  args: {
    merchant: createMerchantRow({ aliases: [] }),
  },
};

export const WithError: Story = {
  name: "带错误提示",
  args: {
    errorMessage: "商家归档失败。",
  },
};
