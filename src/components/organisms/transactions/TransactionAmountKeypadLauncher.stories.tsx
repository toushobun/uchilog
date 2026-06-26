import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";

import { bottomNavigationLayout } from "organisms/navigation/bottomNavigationLayout";

import { TransactionAmountKeypadLauncher } from "./TransactionAmountKeypadLauncher";

function LauncherDemo() {
  const [amount, setAmount] = useState("0");
  const [memo, setMemo] = useState("");

  return (
    <Box sx={{ minHeight: 520, p: 3 }}>
      <Stack spacing={2} sx={{ maxWidth: 360 }}>
        <TextField
          data-amount-currency="JPY"
          data-amount-input="true"
          inputMode="decimal"
          label="金额"
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0"
          value={amount}
        />
        <TextField
          label="普通输入框"
          onChange={(event) => setMemo(event.target.value)}
          placeholder="0"
          value={memo}
        />
        <Typography color="text.secondary" variant="body2">
          当前金额：{amount}
        </Typography>
      </Stack>
      <TransactionAmountKeypadLauncher />
    </Box>
  );
}

function BottomNavigationOverlapDemo() {
  const [amount, setAmount] = useState("0");

  return (
    <Box
      sx={{
        minHeight: 720,
        p: 3,
        pb: bottomNavigationLayout.shellPaddingBottom,
      }}
    >
      <Stack spacing={2} sx={{ maxWidth: 360 }}>
        <Typography sx={{ fontWeight: 800 }} variant="h6">
          底部导航遮挡确认
        </Typography>
        <TextField
          data-amount-currency="JPY"
          data-amount-input="true"
          inputMode="decimal"
          label="金额"
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0"
          value={amount}
        />
        <Typography color="text.secondary" variant="body2">
          打开计算器后，面板应贴底显示并覆盖底部导航。
        </Typography>
      </Stack>
      <Box
        aria-label="底部导航占位"
        sx={{
          bgcolor: "var(--user-theme-nav-bg)",
          borderTop: "1px solid var(--user-theme-nav-border)",
          bottom: 0,
          boxShadow: "0 -8px 24px var(--user-theme-fab-shadow)",
          left: 0,
          pb: bottomNavigationLayout.safeAreaPaddingBottom,
          position: "fixed",
          right: 0,
          zIndex: bottomNavigationLayout.navigationZIndex,
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-around",
            minHeight: 64,
            py: 0.75,
          }}
        >
          <Typography color="text.secondary" variant="caption">
            首页
          </Typography>
          <Typography color="text.secondary" variant="caption">
            明细
          </Typography>
          <Typography color="text.secondary" variant="caption">
            追加
          </Typography>
          <Typography color="text.secondary" variant="caption">
            统计
          </Typography>
          <Typography color="text.secondary" variant="caption">
            设置
          </Typography>
        </Stack>
      </Box>
      <TransactionAmountKeypadLauncher />
    </Box>
  );
}

const meta = {
  title: "Organisms/Transactions/TransactionAmountKeypadLauncher",
  component: TransactionAmountKeypadLauncher,
  render: () => <LauncherDemo />,
} satisfies Meta<typeof TransactionAmountKeypadLauncher>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "金额输入框触发键盘",
};

export const BottomNavigationSafeArea: Story = {
  name: "移动端底部导航遮挡确认",
  render: () => <BottomNavigationOverlapDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByLabelText("金额"));
  },
};
