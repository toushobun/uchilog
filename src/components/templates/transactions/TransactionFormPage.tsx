"use client";

import { useState } from "react";

import Stack from "@mui/material/Stack";

import {
  TransactionForm,
  type TransactionFormInitialValues,
} from "organisms/transactions/TransactionForm";
import { TransactionAmountKeypadLauncher } from "organisms/transactions/TransactionAmountKeypadLauncher";
import { TransferTransactionForm } from "organisms/transactions/TransferTransactionForm";
import { TransactionTypeNavigation } from "molecules/transactions/TransactionTypeNavigation";
import type { TransferEditInitialValues } from "server/loaders/transactionForm";
import type {
  TransactionAccountOption,
  TransactionCategoryOption,
  TransactionMerchantOption,
  TransactionRecordType,
  TransactionTagOption,
} from "types/transactions";
import { PageShell } from "templates/layout/PageShell";

export type TransactionFormTemplateProps = {
  accountOptions: TransactionAccountOption[];
  action: (formData: FormData) => Promise<void>;
  categoryOptions: TransactionCategoryOption[];
  errorMessage: string | null;
  initialType?: TransactionRecordType;
  ledgerName: string;
  merchantOptions: TransactionMerchantOption[];
  tagOptions: TransactionTagOption[];
};

type EditTransactionTemplateProps = Omit<
  TransactionFormTemplateProps,
  "initialType"
> & {
  initialValues: TransactionFormInitialValues;
};

type EditTransferTransactionTemplateProps = {
  accountOptions: TransactionAccountOption[];
  action: (formData: FormData) => Promise<void>;
  errorMessage: string | null;
  initialValues: TransferEditInitialValues;
  ledgerName: string;
};

export function NewTransactionTemplate(props: TransactionFormTemplateProps) {
  return (
    <PageShell>
      <NewTransactionFormView {...props} />
      <TransactionAmountKeypadLauncher />
    </PageShell>
  );
}

function NewTransactionFormView({
  accountOptions,
  action,
  categoryOptions,
  errorMessage,
  initialType,
  ledgerName,
  merchantOptions,
  tagOptions,
}: TransactionFormTemplateProps) {
  const [activeType, setActiveType] = useState<TransactionRecordType>(
    initialType ?? "expense",
  );

  return (
    <Stack spacing={2}>
      <TransactionTypeNavigation
        activeType={activeType}
        onChange={setActiveType}
      />
      {activeType === "transfer" ? (
        <TransferTransactionForm
          action={action}
          accountOptions={accountOptions}
          errorMessage={errorMessage}
          ledgerName={ledgerName}
        />
      ) : (
        <TransactionForm
          action={action}
          accountOptions={accountOptions}
          categoryOptions={categoryOptions}
          errorMessage={errorMessage}
          initialType={activeType}
          ledgerName={ledgerName}
          merchantOptions={merchantOptions}
          tagOptions={tagOptions}
        />
      )}
    </Stack>
  );
}

export function EditTransferTransactionTemplate({
  accountOptions,
  action,
  errorMessage,
  initialValues,
  ledgerName,
}: EditTransferTransactionTemplateProps) {
  return (
    <PageShell>
      <TransferTransactionForm
        action={action}
        accountOptions={accountOptions}
        errorMessage={errorMessage}
        initialValues={initialValues}
        ledgerName={ledgerName}
        title="编辑转账"
      />
      <TransactionAmountKeypadLauncher />
    </PageShell>
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
    <PageShell>
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
      <TransactionAmountKeypadLauncher />
    </PageShell>
  );
}
