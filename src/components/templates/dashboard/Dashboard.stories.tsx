import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { createDashboardViewData } from "@/test/mocks/dashboard";

import { DashboardTemplate } from "./Dashboard";

const meta = {
  title: "Templates/Dashboard/DashboardTemplate",
  component: DashboardTemplate,
  args: {
    data: createDashboardViewData(),
  },
} satisfies Meta<typeof DashboardTemplate>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
