import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { MerchantRow } from "types/merchants";

import { MerchantList } from "./MerchantList";

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
      {
        id: "alias-2",
        merchant_id: "00000000-0000-4000-8000-000000001001",
        alias: "LIFE",
        sort_order: 2,
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
    errorMerchantId: "00000000-0000-4000-8000-000000001001",
    errorMessage: "商家归档失败。",
  },
};

export const Empty: Story = {
  name: "空列表",
  args: {
    merchants: [],
  },
};
