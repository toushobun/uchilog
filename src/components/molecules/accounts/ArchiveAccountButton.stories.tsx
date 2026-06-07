import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ArchiveAccountButton } from "./ArchiveAccountButton";

const meta = {
  title: "Molecules/Accounts/ArchiveAccountButton",
  component: ArchiveAccountButton,
} satisfies Meta<typeof ArchiveAccountButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "归档按钮",
};
