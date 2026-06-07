import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { MerchantRow } from "types/merchants";

import { MerchantsTemplate } from "./Merchants";

const merchants: MerchantRow[] = [
  {
    id: "00000000-0000-4000-8000-000000001001",
    name: "LIFE超市",
    website_url: "https://www.lifecorp.jp",
    icon_url: null,
    note: "常去的超市",
    sort_order: 1,
    created_at: "2026-01-01T00:00:00.000Z",
    aliases: [
      {
        id: "alias-1",
        merchant_id: "00000000-0000-4000-8000-000000001001",
        alias: "来福",
        sort_order: 1,
        created_at: "2026-01-01T00:00:00.000Z",
      },
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000001002",
    name: "Amazon",
    website_url: "https://www.amazon.co.jp",
    icon_url: null,
    note: null,
    sort_order: 2,
    created_at: "2026-01-02T00:00:00.000Z",
    aliases: [],
  },
];

const meta = {
  title: "Templates/Merchants/MerchantsTemplate",
  component: MerchantsTemplate,
  args: {
    archiveMerchantAction: async () => {},
    archiveMerchantAliasAction: async () => {},
    createMerchantAction: async () => {},
    createMerchantAliasAction: async () => {},
    merchants,
    keyword: "",
    ledgerName: "家庭账本",
    errorMerchantId: null,
    errorMessage: null,
    updateMerchantAction: async () => {},
  },
} satisfies Meta<typeof MerchantsTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "商家页面",
};

export const WithKeyword: Story = {
  name: "带搜索词",
  args: {
    keyword: "便利",
  },
};

export const Empty: Story = {
  name: "无商家",
  args: {
    merchants: [],
  },
};

export const WithGlobalError: Story = {
  name: "含全局错误提示",
  args: {
    errorMessage: "商家新增失败。请确认商家名称是否重复，或稍后重试。",
  },
};

export const WithMerchantError: Story = {
  name: "含指定商家错误提示",
  args: {
    errorMerchantId: "00000000-0000-4000-8000-000000001001",
    errorMessage: "商家归档失败。",
  },
};
