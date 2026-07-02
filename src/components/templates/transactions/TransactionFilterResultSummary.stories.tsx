import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { ThemeProvider } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CSSProperties } from "react";

import { getUserThemeCssVariables } from "theme/userThemeCssVariables";
import { userThemeKeys, userThemeTokens } from "theme/userThemeTokens";

import { createDynamicMuiTheme } from "../../providers/DynamicMuiThemeProvider";

import { TransactionFilterResultSummary } from "./TransactionFilterResultSummary";

const meta = {
  title: "Templates/Transactions/TransactionFilterResultSummary",
  component: TransactionFilterResultSummary,
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 380 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof TransactionFilterResultSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FilteredByMerchant: Story = {
  name: "按商家筛选结果",
  args: {
    chips: ["支出", "日常", "支付宝", "2026/07"],
    hasActiveFilters: true,
    label: "按商家显示，筛选结果如下",
    onClear: () => undefined,
  },
};

export const AllThemes: Story = {
  name: "6 款主题",
  render: (args) => (
    <Stack spacing={2}>
      {userThemeKeys.map((themeKey) => (
        <ThemeProvider key={themeKey} theme={createDynamicMuiTheme(themeKey)}>
          <Box
            style={getUserThemeCssVariables(themeKey) as CSSProperties}
            sx={{ maxWidth: 380 }}
          >
            <Typography sx={{ mb: 0.75, fontSize: 12, fontWeight: 800 }}>
              {userThemeTokens[themeKey].name}
            </Typography>
            <TransactionFilterResultSummary {...args} />
          </Box>
        </ThemeProvider>
      ))}
    </Stack>
  ),
  args: {
    chips: ["支出", "日常", "支付宝", "2026/07"],
    hasActiveFilters: true,
    label: "按商家显示，筛选结果如下",
    onClear: () => undefined,
  },
};
