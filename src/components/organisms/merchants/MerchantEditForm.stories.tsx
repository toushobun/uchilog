import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MerchantEditForm } from "./MerchantEditForm";

const meta = {
  title: "Organisms/Merchants/MerchantEditForm",
  component: MerchantEditForm,
  args: {
    action: async () => {},
    merchant: {
      id: "00000000-0000-4000-8000-000000001001",
      name: "LIFE超市",
      website_url: "https://www.lifecorp.jp",
      icon_url: null,
      note: "常去的超市",
      sort_order: 1,
      created_at: "2026-01-01T00:00:00.000Z",
      aliases: [],
    },
  },
} satisfies Meta<typeof MerchantEditForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "编辑商家（含所有字段）",
};

export const WithoutOptionalFields: Story = {
  name: "编辑商家（仅必填项）",
  args: {
    merchant: {
      id: "00000000-0000-4000-8000-000000001002",
      name: "Amazon",
      website_url: null,
      icon_url: null,
      note: null,
      sort_order: 2,
      created_at: "2026-01-01T00:00:00.000Z",
      aliases: [],
    },
  },
};
