import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Typography from "@mui/material/Typography";

import { PageCard } from "./PageCard";

const meta = {
  title: "Molecules/UI/PageCard",
  component: PageCard,
  args: {
    children: <Typography>页面卡片内容区域</Typography>,
  },
} satisfies Meta<typeof PageCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "页面卡片",
};
