import Typography from "@mui/material/Typography";

import { GlassCard } from "ui/GlassCard";
import { getCurrentLedgerOrRedirect } from "@/lib/ledger/current-ledger";

export default async function CategoriesPage() {
  const currentLedger = await getCurrentLedgerOrRedirect();

  return (
    <GlassCard
      sx={{
        p: { xs: 4, sm: 5 },
      }}
    >
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        分类
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        当前账本：{currentLedger.name}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        分类列表和新增功能将在后续 Issue 中实现。
      </Typography>
    </GlassCard>
  );
}
