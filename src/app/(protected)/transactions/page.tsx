import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { TransactionList } from "transactions/TransactionList";
import { GlassCard } from "ui/GlassCard";
import { getCurrentLedgerOrRedirect } from "lib/ledger/current-ledger";

import { loadTransactionListPage } from "./list-actions";

export default async function TransactionsPage() {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const initialPage = await loadTransactionListPage();

  return (
    <GlassCard
      sx={{
        p: { xs: 4, sm: 5 },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ alignItems: { xs: "flex-start", sm: "center" } }}
      >
        <Stack sx={{ flex: 1 }}>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
            记账
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            当前账本：{currentLedger.name}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            初始读取最近 20 条记录，向下滚动时自动继续读取。
          </Typography>
        </Stack>

        <Button href="/transactions/new" variant="contained">
          新增记录
        </Button>
      </Stack>

      <TransactionList
        initialPage={initialPage}
        loadMoreAction={loadTransactionListPage}
      />
    </GlassCard>
  );
}
