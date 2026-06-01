import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { getCurrentLedgerOrRedirect } from "@/lib/ledger/current-ledger";

export default async function AccountsPage() {
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
        账户
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        当前账本：{currentLedger.name}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        账户列表和新增功能将在后续 Issue 中实现。
      </Typography>
    </Paper>
  );
}
