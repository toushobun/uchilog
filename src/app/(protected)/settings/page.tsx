import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { redirect } from "next/navigation";

import { GlassCard } from "ui/GlassCard";
import { UserThemePicker } from "ui/UserThemePicker";
import { getCurrentLedgerContext } from "lib/ledger/current-ledger";
import { logout } from "../actions";

import { SettingsAccountsEntry } from "./SettingsAccountsEntry";

export default async function SettingsPage() {
  const { email, currentLedger } = await getCurrentLedgerContext();

  if (!currentLedger) {
    redirect("/ledger-setup");
  }

  return (
    <Stack spacing={3}>
      <GlassCard
        sx={{
          p: { xs: 4, sm: 5 },
        }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
        >
          <Box>
            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <Typography
                variant="h4"
                sx={{
                  background: "var(--user-theme-title-gradient)",
                  backgroundClip: "text",
                  color: "transparent",
                  fontWeight: 700,
                  WebkitBackgroundClip: "text",
                }}
              >
                UchiLog
              </Typography>
            </Link>
            <Link href="/ledgers" style={{ textDecoration: "none" }}>
              <Typography
                color="text.secondary"
                variant="body2"
                sx={{ mt: 0.5 }}
              >
                当前账本：{currentLedger.name}
              </Typography>
            </Link>
            <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
              {email}
            </Typography>
          </Box>
          <form action={logout}>
            <Button
              type="submit"
              variant="outlined"
              size="small"
              sx={{
                borderColor: "rgba(0, 0, 0, 0.2)",
                color: "text.secondary",
                whiteSpace: "nowrap",
              }}
            >
              登出
            </Button>
          </form>
        </Stack>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 700, mt: 3 }}>
          设置
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
