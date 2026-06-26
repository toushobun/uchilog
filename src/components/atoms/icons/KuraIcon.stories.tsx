import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CSSProperties, ReactNode } from "react";

import { KuraIcon } from "./KuraIcon";
import {
  kuraIconLabels,
  kuraIconNames,
  type KuraIconName,
} from "./kuraIconRegistry";
import { getUserThemeCssVariables } from "theme/userThemeCssVariables";

const meta = {
  title: "Atoms/Icons/KuraIcon",
  component: KuraIcon,
} satisfies Meta<typeof KuraIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

function ThemePreview({ children }: { children: ReactNode }) {
  return (
    <Stack
      spacing={2}
      style={getUserThemeCssVariables("amberWarmth") as CSSProperties}
      sx={{
        bgcolor: "var(--user-theme-page-bg)",
        borderRadius: 3,
        color: "var(--user-theme-action-text)",
        maxWidth: 560,
        p: 2,
      }}
    >
      {children}
    </Stack>
  );
}

function IconTile({ name }: { name: KuraIconName }) {
  return (
    <Stack
      spacing={1}
      sx={{
        alignItems: "center",
        bgcolor: "var(--user-theme-card-bg)",
        border: "1px solid var(--user-theme-card-border)",
        borderRadius: 2,
        color: "var(--user-theme-action-text)",
        minWidth: 104,
        p: 1.5,
      }}
    >
      <KuraIcon name={name} size="lg" title={`${kuraIconLabels[name]}图标`} />
      <Typography
        sx={{ color: "var(--user-theme-balance-text)", fontWeight: 800 }}
        variant="caption"
      >
        {kuraIconLabels[name]}
      </Typography>
    </Stack>
  );
}

export const AllIcons: Story = {
  name: "全部图标",
  render: () => (
    <ThemePreview>
      <Stack spacing={0.5}>
        <Typography sx={{ color: "var(--user-theme-balance-text)", fontWeight: 900 }}>
          KuraNote 自定义图标
        </Typography>
        <Typography color="text.secondary" variant="body2">
          第一版只展示资产基础层，不替换业务页面。
        </Typography>
      </Stack>
      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: "repeat(auto-fit, minmax(104px, 1fr))",
        }}
      >
        {kuraIconNames.map((name) => (
          <IconTile key={name} name={name} />
        ))}
      </Box>
    </ThemePreview>
  ),
};

export const Sizes: Story = {
  name: "尺寸",
  render: () => (
    <ThemePreview>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <KuraIcon name="quickRecord" size="sm" title="小尺寸快速记账图标" />
        <KuraIcon name="quickRecord" size="md" title="中尺寸快速记账图标" />
        <KuraIcon name="quickRecord" size="lg" title="大尺寸快速记账图标" />
      </Stack>
    </ThemePreview>
  ),
};
