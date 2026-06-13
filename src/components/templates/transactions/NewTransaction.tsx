import type { ReactNode } from "react";

import {
  TransactionForm,
  type TransactionFormInitialValues,
} from "organisms/transactions/TransactionForm";
import { TransactionAmountKeypadLauncher } from "organisms/transactions/TransactionAmountKeypadLauncher";
import type {
  TransactionAccountOption,
  TransactionCategoryOption,
  TransactionMerchantOption,
} from "types/transactions";
import { PageShell } from "templates/layout/PageShell";

export type TransactionFormTemplateProps = {
  accountOptions: TransactionAccountOption[];
  action: (formData: FormData) => Promise<void>;
  categoryOptions: TransactionCategoryOption[];
  errorMessage: string | null;
  ledgerName: string;
  merchantOptions: TransactionMerchantOption[];
};

type EditTransactionTemplateProps = TransactionFormTemplateProps & {
  initialValues: TransactionFormInitialValues;
};

export function NewTransactionTemplate({
  accountOptions,
  action,
  categoryOptions,
  errorMessage,
  ledgerName,
  merchantOptions,
}: TransactionFormTemplateProps) {
  return (
    <TransactionFormShell>
      <TransactionForm
        action={action}
        accountOptions={accountOptions}
        categoryOptions={categoryOptions}
        errorMessage={errorMessage}
        ledgerName={ledgerName}
        merchantOptions={merchantOptions}
      />
    </TransactionFormShell>
  );
}

export function EditTransactionTemplate({
  accountOptions,
  action,
  categoryOptions,
  errorMessage,
  initialValues,
  ledgerName,
  merchantOptions,
}: EditTransactionTemplateProps) {
  return (
    <TransactionFormShell>
      <TransactionForm
        action={action}
        accountOptions={accountOptions}
        categoryOptions={categoryOptions}
        errorMessage={errorMessage}
        formId="edit-transaction-form"
        initialValues={initialValues}
        ledgerName={ledgerName}
        merchantOptions={merchantOptions}
        submitLabel="保存修改"
        title="编辑记账"
      />
    </TransactionFormShell>
  );
}

function TransactionFormShell({ children }: { children: ReactNode }) {
  return (
    <PageShell>
      {children}
      <TransactionAmountKeypadLauncher />
    </PageShell>
  );
}
