import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { getCurrentLedgerOrRedirect } from "@/lib/ledger/current-ledger";

export default async function DashboardPage() {
  const currentLedger = await getCurrentLedgerOrRedirect();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 4, sm: 5 },
        border: "1px solid",
        borderColor: "divider",
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
    </Paper>
  );
}
