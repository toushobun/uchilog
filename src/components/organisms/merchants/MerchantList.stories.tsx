import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  createMerchantAliasRow,
  createMerchantRow,
} from "@/test/mocks/merchants";

import { MerchantList } from "./MerchantList";

const merchants = [
  createMerchantRow({
    aliases: [
      createMerchantAliasRow(),
      createMerchantAliasRow({ alias: "LIFE", id: "alias-2", sort_order: 2 }),
    ],
    note: "常去的超市",
  }),
  createMerchantRow({
    id: "00000000-0000-4000-8000-000000001002",
    name: "Amazon",
    sort_order: 2,
    website_url: "https://www.amazon.co.jp",
  }),
];

const meta = {
  title: "Organisms/Merchants/MerchantList",
  component: MerchantList,
  args: {
    archiveAliasAction: async () => {},
    archiveMerchantAction: async () => {},
    createAliasAction: async () => {},
    merchants,
    errorMerchantId: null,
    errorMessage: null,
    updateMerchantAction: async () => {},
  },
} satisfies Meta<typeof MerchantList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "商家列表",
};

export const WithMerchantError: Story = {
  name: "指定商家含错误提示",
  args: {
    errorMerchantId: merchants[0].id,
    errorMessage: "商家归档失败。",
  },
};

export const Empty: Story = {
  name: "空列表",
  args: {
    merchants: [],
  },
};
