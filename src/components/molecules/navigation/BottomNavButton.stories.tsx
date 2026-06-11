import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BottomNavButton } from "./BottomNavButton";

const meta = {
  title: "Molecules/Navigation/BottomNavButton",
  component: BottomNavButton,
  args: {
    href: "/dashboard",
    label: "仪表盘",
    selected: false,
  },
} satisfies Meta<typeof BottomNavButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "未选中状态",
};

export const Selected: Story = {
  name: "选中状态",
  args: {
    selected: true,
  },
};
