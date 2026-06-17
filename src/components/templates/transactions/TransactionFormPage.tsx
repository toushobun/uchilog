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
  TransactionTagOption,
} from "types/transactions";
import { PageShell } from "templates/layout/PageShell";

export type TransactionFormTemplateProps = {
  accountOptions: TransactionAccountOption[];
  action: (formData: FormData) => Promise<void>;
  categoryOptions: TransactionCategoryOption[];
  errorMessage: string | null;
  ledgerName: string;
  merchantOptions: TransactionMerchantOption[];
  tagOptions: TransactionTagOption[];
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
  tagOptions,
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
        tagOptions={tagOptions}
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
  tagOptions,
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
        tagOptions={tagOptions}
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
