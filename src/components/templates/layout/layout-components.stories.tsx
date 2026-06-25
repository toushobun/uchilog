import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CSSProperties, ReactNode } from "react";

import { IconBadge } from "atoms/ui/IconBadge";
import { SectionCard } from "molecules/ui/SectionCard";
import { getUserThemeCssVariables } from "theme/userThemeCssVariables";

import { PageFrame } from "./PageFrame";
import { PageHeader } from "./PageHeader";
import { PageShell } from "./PageShell";

const meta = {
  title: "Templates/Layout/CommonLayout",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function ThemeStory({ children }: { children: ReactNode }) {
  return (
    <div style={getUserThemeCssVariables("amberWarmth") as CSSProperties}>
      {children}
    </div>
  );
}

export const FrameWithHeader: Story = {
  name: "PageFrame + PageHeader",
  render: () => (
    <ThemeStory>
      <PageFrame>
        <PageHeader
          leading={
            <IconBadge label="账户图标">
              <AccountBalanceWalletRoundedIcon fontSize="small" />
            </IconBadge>
          }
          title="账户"
          subtitle="管理现金、银行账户、信用卡、电子钱包等账户。"
          action={<Button variant="contained">新增账户</Button>}
        />
        <SectionCard>页面主要内容区域</SectionCard>
      </PageFrame>
    </ThemeStory>
  ),
};

export const ShellWithHeader: Story = {
  name: "PageShell + PageHeader（既存）",
  render: () => (
    <ThemeStory>
      <PageShell>
        <PageHeader
          title="账户"
          subtitle="管理现金、银行账户、信用卡、电子钱包等账户。"
          action={<Button variant="contained">新增账户</Button>}
        />
        <SectionCard>页面主要内容区域</SectionCard>
      </PageShell>
    </ThemeStory>
  ),
};

export const HeaderOnly: Story = {
  name: "PageHeader",
  render: () => (
    <ThemeStory>
      <PageHeader
        title="商家"
        subtitle="管理常用商家、平台、公司和个人。"
        action={<Button variant="outlined">导入</Button>}
      />
    </ThemeStory>
  ),
};

export const HeaderWithRichSubtitle: Story = {
  name: "PageHeader（ReactNode subtitle）",
  render: () => (
    <ThemeStory>
      <PageHeader
        title="统计"
        subtitle={
          <Stack spacing={0.5}>
            <span>当前账本：家庭账本</span>
            <Typography color="text.secondary" variant="body2">
              按月份整理收支、分类和商家，让家庭账本一眼看清。
            </Typography>
          </Stack>
        }
      />
    </ThemeStory>
  ),
};
