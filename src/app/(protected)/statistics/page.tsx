import Typography from "@mui/material/Typography";

import { GlassCard } from "ui/GlassCard";
import { getCurrentLedgerOrRedirect } from "@/lib/ledger/current-ledger";

export default async function StatisticsPage() {
  const currentLedger = await getCurrentLedgerOrRedirect();

  return (
    <GlassCard
      sx={{
        p: { xs: 4, sm: 5 },
      }}
    >
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        统计
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        当前账本：{currentLedger.name}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        收支统计将在后续 Issue 中实现。
      </Typography>
    </GlassCard>
  );
}
