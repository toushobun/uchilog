import { TransactionForm } from "organisms/transactions/TransactionForm";
import { TransactionAmountKeypadLauncher } from "organisms/transactions/TransactionAmountKeypadLauncher";
import type {
  TransactionAccountOption,
  TransactionCategoryOption,
  TransactionMerchantOption,
} from "types/transactions";
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
      <TransactionForm
        action={action}
        accountOptions={accountOptions}
        categoryOptions={categoryOptions}
        errorMessage={errorMessage}
        ledgerName={ledgerName}
        merchantOptions={merchantOptions}
      />
      <TransactionAmountKeypadLauncher />
    </PageShell>
  );
}
