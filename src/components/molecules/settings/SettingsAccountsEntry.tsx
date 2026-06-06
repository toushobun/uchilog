import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { GlassCard } from "ui/GlassCard";

export function SettingsAccountsEntry() {
  return (
    <GlassCard
      sx={{
        p: { xs: 3, sm: 4 },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
        }}
      >
        <Stack spacing={1}>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
            账户管理
          </Typography>
          <Typography color="text.secondary">
            管理当前账本的现金、银行卡、信用卡等账户，并可继续新增账户。
          </Typography>
        </Stack>

        <Button href="/accounts" variant="contained">
          打开账户管理
        </Button>
      </Stack>
    </GlassCard>
  );
}
