import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { GlassCard } from "./GlassCard";

const meta = {
  title: "Atoms/UI/GlassCard",
  component: GlassCard,
} satisfies Meta<typeof GlassCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "默认",
  args: {
    sx: { p: 3 },
    children: <Typography>这是一张玻璃卡片内容区域</Typography>,
  },
};

export const WithLargePadding: Story = {
  name: "大内边距",
  args: {
    sx: { p: { xs: 4, sm: 5 } },
    children: <Typography>页面级别的卡片内边距</Typography>,
  },
};

export const DashedBorder: Story = {
  name: "虚线边框（空状态用）",
  args: {
    sx: { p: 3, borderStyle: "dashed" },
    children: <Typography color="text.secondary">暂无内容</Typography>,
  },
};
