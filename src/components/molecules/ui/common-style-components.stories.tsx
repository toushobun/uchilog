import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CSSProperties, ReactNode } from "react";

import { IconBadge } from "atoms/ui/IconBadge";
import { getUserThemeCssVariables } from "theme/userThemeCssVariables";
import { userThemeKeys, userThemeTokens } from "theme/userThemeTokens";

import { EmptyState } from "./EmptyState";
import { FieldCard } from "./FieldCard";
import { ReceiptCard } from "./ReceiptCard";
import { SectionCard } from "./SectionCard";
import { SegmentTabs, type SegmentTabItem } from "./SegmentTabs";

const segmentItems = [
  { label: "日", value: "day" },
  { label: "月", value: "month" },
  { label: "年", value: "year" },
] as const satisfies readonly SegmentTabItem[];

function CommonStyleComponentsPreview() {
  return (
    <ThemePreview themeKey="amberWarmth">
      <ComponentGallery />
    </ThemePreview>
  );
}

const meta = {
  title: "Molecules/UI/CommonStyleComponents",
  component: CommonStyleComponentsPreview,
} satisfies Meta<typeof CommonStyleComponentsPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

function ThemePreview({
  children,
  themeKey,
}: {
  children: ReactNode;
  themeKey: (typeof userThemeKeys)[number];
}) {
  return (
    <Stack
      spacing={2}
      style={getUserThemeCssVariables(themeKey) as CSSProperties}
      sx={{
        background: "var(--user-theme-page-bg)",
        borderRadius: 3,
        color: "var(--user-theme-balance-text)",
        maxWidth: 520,
        p: 2,
      }}
    >
      <Typography sx={{ fontWeight: 900 }}>
        {userThemeTokens[themeKey].name}
      </Typography>
      {children}
    </Stack>
  );
}

function ComponentGallery() {
  return (
    <Stack spacing={2}>
      <SectionCard>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <IconBadge label="账户图标">
              <AccountBalanceWalletRoundedIcon fontSize="small" />
            </IconBadge>
            <Stack spacing={0.25}>
              <Typography sx={{ fontWeight: 900 }}>共通信息卡片</Typography>
              <Typography color="text.secondary" variant="body2">
                使用 KuraNote token 的卡片、图标底座和文字层级。
              </Typography>
            </Stack>
          </Stack>
          <SegmentTabs
            ariaLabel="统计期间"
            items={segmentItems}
            value="month"
            onChange={() => undefined}
          />
        </Stack>
      </SectionCard>

      <FieldCard
        selected
        title="常用商家"
        description="用于表单中的账户、商家、分类、标签选择区。"
        leading={
          <IconBadge label="商家图标" size="sm">
            <StorefrontRoundedIcon fontSize="small" />
          </IconBadge>
        }
        action={<Button size="small">选择</Button>}
      />

      <FieldCard
        disabled
        title="不可选择项目"
        description="用于展示表单项禁用状态。"
        leading={
          <IconBadge label="禁用图标" size="sm">
            <StorefrontRoundedIcon fontSize="small" />
          </IconBadge>
        }
      />

      <ReceiptCard
        header={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <ReceiptLongRoundedIcon fontSize="small" />
            <Typography sx={{ fontWeight: 900 }}>小票卡片</Typography>
          </Stack>
        }
        footer="交易业务标记由 organisms/transactions 单独展示。"
      >
        <Typography variant="body2">
          仅用于明细 / 小票语境，和普通 SectionCard 语义分离。
        </Typography>
      </ReceiptCard>
    </Stack>
  );
}

export const Default: Story = {
  name: "默认组件组合",
  render: () => <CommonStyleComponentsPreview />,
};

export const Empty: Story = {
  name: "空状态",
  render: () => (
    <ThemePreview themeKey="amberWarmth">
      <EmptyState
        title="还没有记录"
        description="开始记录第一笔家庭生活账。"
        illustration={
          <IconBadge label="空状态图标" size="lg">
            <ReceiptLongRoundedIcon />
          </IconBadge>
        }
        action={<Button variant="contained">新增记录</Button>}
      />
    </ThemePreview>
  ),
};

export const SixThemes: Story = {
  name: "6 款主题展示",
  render: () => (
    <Stack spacing={2}>
      {userThemeKeys.map((themeKey) => (
        <ThemePreview key={themeKey} themeKey={themeKey}>
          <ComponentGallery />
        </ThemePreview>
      ))}
    </Stack>
  ),
};
