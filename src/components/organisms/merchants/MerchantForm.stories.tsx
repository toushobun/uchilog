import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MerchantForm } from "./MerchantForm";

const meta = {
  title: "Organisms/Merchants/MerchantForm",
  component: MerchantForm,
  args: {
    action: async () => {},
  },
} satisfies Meta<typeof MerchantForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "新增商家表单",
};
