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
  TransactionType,
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

type EditTransferTransactionTemplateProps = Omit<
  TransactionFormTemplateProps,
  "initialType"
> & {
  initialValues: TransferEditInitialValues;
};

function isNormalTransactionType(
  type: TransactionRecordType,
): type is TransactionType {
  return type !== "transfer";
}

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
  const typeNavigation = (
    <TransactionTypeNavigation
      activeType={activeType}
      onChange={setActiveType}
    />
  );

  return (
    <Stack spacing={2}>
      {isNormalTransactionType(activeType) ? (
        <TransactionForm
          action={action}
          accountOptions={accountOptions}
          categoryOptions={categoryOptions}
          errorMessage={errorMessage}
          initialType={activeType}
          ledgerName={ledgerName}
          merchantOptions={merchantOptions}
          tagOptions={tagOptions}
          typeNavigation={typeNavigation}
        />
      ) : (
        <TransferTransactionForm
          action={action}
          accountOptions={accountOptions}
          errorMessage={errorMessage}
          ledgerName={ledgerName}
          typeNavigation={typeNavigation}
        />
      )}
    </Stack>
  );
}

export function EditTransferTransactionTemplate({
  accountOptions,
  action,
  categoryOptions,
  errorMessage,
  initialValues,
  ledgerName,
  merchantOptions,
  tagOptions,
}: EditTransferTransactionTemplateProps) {
  const [activeType, setActiveType] =
    useState<TransactionRecordType>("transfer");
  const formId =
    activeType === "transfer"
      ? "edit-transfer-transaction-form"
      : "edit-transaction-form";
  const typeNavigation = (
    <TransactionTypeNavigation
      activeType={activeType}
      onChange={setActiveType}
    />
  );

  return (
    <PageShell>
      <Stack spacing={2}>
        {isNormalTransactionType(activeType) ? (
          <>
            <input
              form={formId}
              name="sourceType"
              readOnly
              type="hidden"
              value="transfer"
            />
            <TransactionForm
              key={activeType}
              action={action}
              accountOptions={accountOptions}
              categoryOptions={categoryOptions}
              errorMessage={errorMessage}
              formId={formId}
              initialValues={createNormalInitialValuesFromTransfer(
                initialValues,
                activeType,
              )}
              ledgerName={ledgerName}
              merchantOptions={merchantOptions}
              submitLabel="保存修改"
              tagOptions={tagOptions}
              title="编辑记账"
              typeNavigation={typeNavigation}
            />
          </>
        ) : (
          <TransferTransactionForm
            action={action}
            accountOptions={accountOptions}
            errorMessage={errorMessage}
            formId={formId}
            initialValues={initialValues}
            ledgerName={ledgerName}
            sourceType="transfer"
            title="编辑转账"
            typeNavigation={typeNavigation}
          />
        )}
      </Stack>
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
  const [activeType, setActiveType] = useState<TransactionRecordType>(
    initialValues.type,
  );
  const formId =
    activeType === "transfer"
      ? "edit-transfer-transaction-form"
      : "edit-transaction-form";
  const typeNavigation = (
    <TransactionTypeNavigation
      activeType={activeType}
      onChange={setActiveType}
    />
  );

  return (
    <PageShell>
      <Stack spacing={2}>
        {isNormalTransactionType(activeType) ? (
          <>
            <input
              form={formId}
              name="sourceType"
              readOnly
              type="hidden"
              value={initialValues.type}
            />
            <TransactionForm
              key={activeType}
              action={action}
              accountOptions={accountOptions}
              categoryOptions={categoryOptions}
              errorMessage={errorMessage}
              formId={formId}
              initialValues={createNormalInitialValuesFromNormal(
                initialValues,
                activeType,
              )}
              ledgerName={ledgerName}
              merchantOptions={merchantOptions}
              submitLabel="保存修改"
              tagOptions={tagOptions}
              title="编辑记账"
              typeNavigation={typeNavigation}
            />
          </>
        ) : (
          <TransferTransactionForm
            action={action}
            accountOptions={accountOptions}
            errorMessage={errorMessage}
            formId={formId}
            initialValues={createTransferInitialValuesFromNormal(
              initialValues,
              accountOptions,
            )}
            ledgerName={ledgerName}
            sourceType={initialValues.type}
            title="编辑转账"
            typeNavigation={typeNavigation}
          />
        )}
      </Stack>
      <TransactionAmountKeypadLauncher />
    </PageShell>
  );
}

function createNormalInitialValuesFromNormal(
  initialValues: TransactionFormInitialValues,
  targetType: TransactionType,
): TransactionFormInitialValues {
  if (targetType === initialValues.type) return initialValues;

  return {
    ...initialValues,
    items: [],
    type: targetType,
  };
}

function createTransferInitialValuesFromNormal(
  initialValues: TransactionFormInitialValues,
  accountOptions: TransactionAccountOption[],
): TransferEditInitialValues {
  return {
    accountId: initialValues.accountId,
    note: initialValues.note,
    transactionAt: initialValues.transactionAt,
    transactionRecordId: initialValues.transactionRecordId ?? "",
    transferAmount: totalAmountText(initialValues.items),
    transferTargetAccountId: findTransferTargetAccountId(
      accountOptions,
      initialValues.accountId,
    ),
    type: "transfer",
  };
}

function createNormalInitialValuesFromTransfer(
  initialValues: TransferEditInitialValues,
  targetType: TransactionType,
): TransactionFormInitialValues {
  return {
    accountId: initialValues.accountId,
    items: [],
    merchantId: "",
    note: initialValues.note,
    tagNames: [],
    transactionAt: initialValues.transactionAt,
    transactionRecordId: initialValues.transactionRecordId,
    type: targetType,
  };
}

function totalAmountText(items: TransactionFormInitialValues["items"]) {
  const total = items.reduce((sum, item) => {
    const amount = Number(item.amount);
    return Number.isFinite(amount) ? sum + amount : sum;
  }, 0);

  if (total <= 0) return "";

  return total
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1");
}

function findTransferTargetAccountId(
  accountOptions: TransactionAccountOption[],
  accountId: string,
) {
  const sourceAccount = accountOptions.find(
    (account) => account.id === accountId,
  );
  const sameCurrencyAccount = accountOptions.find(
    (account) =>
      account.id !== accountId && account.currency === sourceAccount?.currency,
  );

  return sameCurrencyAccount?.id ?? "";
}
