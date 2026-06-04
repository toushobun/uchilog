import Typography from "@mui/material/Typography";

import { GlassCard } from "ui/GlassCard";
import { getCurrentLedgerOrRedirect } from "@/lib/ledger/current-ledger";

export default async function DashboardPage() {
  const currentLedger = await getCurrentLedgerOrRedirect();

  return (
    <GlassCard
      sx={{
        p: { xs: 4, sm: 5 },
      }}
    >
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        Dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        当前账本：{currentLedger.name}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        登录后的首页占位内容。正式的统计信息将在后续 Issue 中实现。
      </Typography>
    </GlassCard>
  );
}
