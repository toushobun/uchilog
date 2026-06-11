import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { createMerchantRow } from "@/test/mocks/merchants";

import { MerchantEditForm } from "./MerchantEditForm";

const meta = {
  title: "Organisms/Merchants/MerchantEditForm",
  component: MerchantEditForm,
  args: {
    action: async () => {},
    merchant: createMerchantRow({ note: "常去的超市" }),
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
    merchant: createMerchantRow({
      id: "00000000-0000-4000-8000-000000001002",
      name: "Amazon",
      note: null,
      sort_order: 2,
      website_url: null,
    }),
  },
};
