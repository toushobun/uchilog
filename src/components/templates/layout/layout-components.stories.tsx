import Button from "@mui/material/Button";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SectionCard } from "molecules/ui/SectionCard";

import { PageHeader } from "./PageHeader";
import { PageShell } from "./PageShell";

const meta = {
  title: "Templates/Layout/CommonLayout",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ShellWithHeader: Story = {
  name: "PageShell + PageHeader",
  render: () => (
    <PageShell>
      <PageHeader
        title="账户"
        subtitle="管理现金、银行账户、信用卡、电子钱包等账户。"
        action={<Button variant="contained">新增账户</Button>}
      />
      <SectionCard>页面主要内容区域</SectionCard>
    </PageShell>
  ),
};

export const HeaderOnly: Story = {
  name: "PageHeader",
  render: () => (
    <PageHeader
      title="商家"
      subtitle="管理常用商家、平台、公司和个人。"
      action={<Button variant="outlined">导入</Button>}
    />
  ),
};
