import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { HomeTemplate } from "./Home";

const meta = {
  title: "Templates/Home/HomeTemplate",
  component: HomeTemplate,
} satisfies Meta<typeof HomeTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "首页",
};
