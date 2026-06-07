import Typography from "@mui/material/Typography";

import { createTransaction } from "server/actions/transactions";
import { TransactionForm } from "transactions/TransactionForm";
import type {
  TransactionAccountOption,
  TransactionCategoryOption,
  TransactionMerchantOption,
} from "types/transactions";
import { PageCard } from "ui-molecules/PageCard";

type NewTransactionPageProps = {
  accountOptions: TransactionAccountOption[];
  categoryOptions: TransactionCategoryOption[];
  errorMessage: string | null;
  ledgerName: string;
  merchantOptions: TransactionMerchantOption[];
};

export function NewTransactionPage({
  accountOptions,
  categoryOptions,
  errorMessage,
  ledgerName,
  merchantOptions,
}: NewTransactionPageProps) {
  return (
    <PageCard>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        新增记录
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        当前账本：{ledgerName}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        录入一笔最基础的收入或支出。余额联动将在后续单独实现。
      </Typography>

      <TransactionForm
        action={createTransaction}
        accountOptions={accountOptions}
        categoryOptions={categoryOptions}
        errorMessage={errorMessage}
        merchantOptions={merchantOptions}
      />
    </PageCard>
  );
}
