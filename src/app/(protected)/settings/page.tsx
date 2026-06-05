import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { GlassCard } from "ui/GlassCard";
import { UserThemePicker } from "ui/UserThemePicker";
import { getCurrentLedgerOrRedirect } from "lib/ledger/current-ledger";

import { SettingsAccountsEntry } from "./SettingsAccountsEntry";

export default async function SettingsPage() {
  const currentLedger = await getCurrentLedgerOrRedirect();

  return (
    <Stack spacing={3}>
      <GlassCard
        sx={{
          p: { xs: 4, sm: 5 },
        }}
      >
        <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
          设置
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          当前账本：{currentLedger.name}
        </Typography>
      </GlassCard>

      <SettingsAccountsEntry />

      <GlassCard
        sx={{
          p: { xs: 3, sm: 4 },
        }}
      >
        <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
          个人主题
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          只影响当前登录用户看到的界面氛围，不会改变账本成员显示色。
        </Typography>
        <UserThemePicker />
      </GlassCard>
    </Stack>
  );
}
