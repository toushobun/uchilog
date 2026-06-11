import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SettingsCategoriesEntry } from "./SettingsCategoriesEntry";

const meta: Meta<typeof SettingsCategoriesEntry> = {
  component: SettingsCategoriesEntry,
  parameters: {
    layout: "centered",
  },
  title: "Molecules/Settings/CategoriesEntry",
};

export default meta;
type Story = StoryObj<typeof SettingsCategoriesEntry>;

export const Default: Story = {
  name: "分类管理入口",
};
