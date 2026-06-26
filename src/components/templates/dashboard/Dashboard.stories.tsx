import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CSSProperties } from "react";

import { createDashboardViewData } from "@/test/mocks/dashboard";
import { getUserThemeCssVariables } from "theme/userThemeCssVariables";
import type { UserThemeKey } from "theme/userThemeTokens";

import { DashboardTemplate } from "./Dashboard";

const dashboardData = createDashboardViewData();

function renderWithTheme(themeKey: UserThemeKey) {
  return function ThemedDashboardTemplate() {
    return (
      <div
        data-user-theme={themeKey}
        style={getUserThemeCssVariables(themeKey) as CSSProperties}
      >
        <DashboardTemplate data={dashboardData} />
      </div>
    );
  };
}

const meta = {
  title: "Templates/Dashboard/DashboardTemplate",
  component: DashboardTemplate,
  args: {
    data: dashboardData,
  },
} satisfies Meta<typeof DashboardTemplate>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "琥珀暖阳",
  render: renderWithTheme("amberWarmth"),
};

export const LavenderDream: Story = {
  name: "薰衣草梦境",
  render: renderWithTheme("lavenderDream"),
};

export const EmeraldMorning: Story = {
  name: "翡翠晨露",
  render: renderWithTheme("emeraldMorning"),
};

export const SakuraStory: Story = {
  name: "粉樱物语",
  render: renderWithTheme("sakuraStory"),
};

export const DeepSeaStarlight: Story = {
  name: "深海星光",
  render: renderWithTheme("deepSeaStarlight"),
};

export const FlameRed: Story = {
  name: "烈焰赤红",
  render: renderWithTheme("flameRed"),
};
