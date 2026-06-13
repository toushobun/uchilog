import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MonthNavButton } from "./MonthNavButton";

const meta = {
  title: "Molecules/Navigation/MonthNavButton",
  component: MonthNavButton,
  args: {
    children: "‹ 上个月",
    href: "/statistics?month=2026-05",
  },
} satisfies Meta<typeof MonthNavButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PreviousMonth: Story = {
  name: "上个月",
};

export const NextMonth: Story = {
  name: "下个月",
  args: {
    children: "下个月 ›",
    href: "/statistics?month=2026-07",
  },
};
