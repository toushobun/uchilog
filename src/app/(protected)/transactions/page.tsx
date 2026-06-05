import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { TransactionList } from "transactions/TransactionList";
import { GlassCard } from "ui/GlassCard";
import { getCurrentLedgerOrRedirect } from "lib/ledger/current-ledger";

import { voidTransaction } from "./actions";
import { loadTransactionListPage } from "./list-actions";

type TransactionsPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const errorMessages: Record<string, string> = {
  void_failed: "记账撤销失败。请稍后重试。",
  void_invalid: "撤销对象不正确。",
};

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const params = await searchParams;
  const errorMessage = params.error ? (errorMessages[params.error] ?? null) : null;
  const initialPage = await loadTransactionListPage();

  return (
    <GlassCard sx={{ p: { xs: 4, sm: 5 } }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { xs: "flex-start", sm: "center" } }}>
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

      {errorMessage ? (
        <Typography color="error" sx={{ mt: 3 }}>
          {errorMessage}
        </Typography>
      ) : null}

      <TransactionList initialPage={initialPage} loadMoreAction={loadTransactionListPage} voidAction={voidTransaction} />
    </GlassCard>
  );
}
