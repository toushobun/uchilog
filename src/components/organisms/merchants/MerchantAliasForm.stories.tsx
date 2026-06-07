import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MerchantAliasForm } from "./MerchantAliasForm";

const meta = {
  title: "Organisms/Merchants/MerchantAliasForm",
  component: MerchantAliasForm,
  args: {
    action: async () => {},
    merchantId: "00000000-0000-4000-8000-000000001001",
  },
} satisfies Meta<typeof MerchantAliasForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "新增别名表单",
};
