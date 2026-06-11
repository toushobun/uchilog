import Stack from "@mui/material/Stack";

import { TransactionForm } from "organisms/transactions/TransactionForm";
import type {
  TransactionAccountOption,
  TransactionCategoryOption,
  TransactionMerchantOption,
} from "types/transactions";
import { PageHeader } from "templates/layout/PageHeader";
import { PageShell } from "templates/layout/PageShell";

type NewTransactionTemplateProps = {
  accountOptions: TransactionAccountOption[];
  action: (formData: FormData) => Promise<void>;
  categoryOptions: TransactionCategoryOption[];
  errorMessage: string | null;
  ledgerName: string;
  merchantOptions: TransactionMerchantOption[];
};

export function NewTransactionTemplate({
  accountOptions,
  action,
  categoryOptions,
  errorMessage,
  ledgerName,
  merchantOptions,
}: NewTransactionTemplateProps) {
  return (
    <PageShell>
      <PageHeader
        title="新增记录"
        subtitle={
          <Stack spacing={0.5}>
            <span>当前账本：{ledgerName}</span>
            <span>录入一笔最基础的收入或支出。余额联动将在后续单独实现。</span>
          </Stack>
        }
      />

      <TransactionForm
        action={action}
        accountOptions={accountOptions}
        categoryOptions={categoryOptions}
        errorMessage={errorMessage}
        merchantOptions={merchantOptions}
      />
    </PageShell>
  );
}
