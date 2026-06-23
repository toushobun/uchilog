"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import {
  TransactionForm,
  type TransactionFormInitialValues,
} from "organisms/transactions/TransactionForm";
import { TransactionAmountKeypadLauncher } from "organisms/transactions/TransactionAmountKeypadLauncher";
import { TransactionFormHeader } from "organisms/transactions/TransactionFormHeader";
import { TransferTransactionForm } from "organisms/transactions/TransferTransactionForm";
import { TransactionTypeNavigation } from "molecules/transactions/TransactionTypeNavigation";
import { routePaths } from "config/paths";
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

const transactionTypeOrder: readonly TransactionRecordType[] = [
  "expense",
  "income",
  "transfer",
];

type TransactionTypeSlidePanelsProps = {
  activeType: TransactionRecordType;
  panels: Record<TransactionRecordType, ReactNode>;
};

function TransactionTypeSlidePanels({
  activeType,
  panels,
}: TransactionTypeSlidePanelsProps) {
  const panelRefs = useRef<
    Record<TransactionRecordType, HTMLDivElement | null>
  >({
    expense: null,
    income: null,
    transfer: null,
  });
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const activeIndex = transactionTypeOrder.indexOf(activeType);

  useLayoutEffect(() => {
    const activePanel = panelRefs.current[activeType];
    if (!activePanel) return;

    function updateContainerHeight() {
      const currentPanel = panelRefs.current[activeType];
      if (!currentPanel) return;

      setContainerHeight(currentPanel.getBoundingClientRect().height);
    }

    updateContainerHeight();

    if (typeof ResizeObserver === "undefined") return;

    const resizeObserver = new ResizeObserver(updateContainerHeight);
    resizeObserver.observe(activePanel);

    return () => {
      resizeObserver.disconnect();
    };
  }, [activeType]);

  return (
    <Box
      data-testid="transaction-type-slide-panels"
      sx={(theme) => ({
        height: containerHeight ?? "auto",
        overflow: "hidden",
        transition: theme.transitions.create("height", {
          duration: theme.transitions.duration.shorter,
          easing: theme.transitions.easing.easeInOut,
        }),
        width: "100%",
      })}
    >
      <Box
        sx={(theme) => ({
          alignItems: "flex-start",
          display: "flex",
          transform: `translateX(-${activeIndex * 100}%)`,
          transition: theme.transitions.create("transform", {
            duration: theme.transitions.duration.shorter,
            easing: theme.transitions.easing.easeInOut,
          }),
          width: "100%",
        })}
      >
        {transactionTypeOrder.map((type) => (
          <Box
            key={type}
            ref={(element: HTMLDivElement | null) => {
              panelRefs.current[type] = element;
            }}
            aria-hidden={type !== activeType}
            data-testid={`transaction-type-slide-panel-${type}`}
            inert={type !== activeType ? true : undefined}
            sx={{ flex: "0 0 100%" }}
          >
            {panels[type]}
          </Box>
        ))}
      </Box>
    </Box>
  );
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
  const [submitDisabledByType, setSubmitDisabledByType] = useState<
    Record<TransactionRecordType, boolean>
  >({ expense: true, income: true, transfer: true });

  const activeFormId = `new-${activeType}-transaction-form`;

  const panels = useMemo(
    () => ({
      expense: (
        <TransactionForm
          action={action}
          accountOptions={accountOptions}
          categoryOptions={categoryOptions}
          errorMessage={errorMessage}
          formId="new-expense-transaction-form"
          hideHeader
          initialType="expense"
          merchantOptions={merchantOptions}
          onSubmitDisabledChange={(disabled) =>
            setSubmitDisabledByType((prev) => ({ ...prev, expense: disabled }))
          }
          tagOptions={tagOptions}
        />
      ),
      income: (
        <TransactionForm
          action={action}
          accountOptions={accountOptions}
          categoryOptions={categoryOptions}
          errorMessage={errorMessage}
          formId="new-income-transaction-form"
          hideHeader
          initialType="income"
          merchantOptions={merchantOptions}
          onSubmitDisabledChange={(disabled) =>
            setSubmitDisabledByType((prev) => ({ ...prev, income: disabled }))
          }
          tagOptions={tagOptions}
        />
      ),
      transfer: (
        <TransferTransactionForm
          action={action}
          accountOptions={accountOptions}
          errorMessage={errorMessage}
          formId="new-transfer-transaction-form"
          hideHeader
          onSubmitDisabledChange={(disabled) =>
            setSubmitDisabledByType((prev) => ({ ...prev, transfer: disabled }))
          }
        />
      ),
    }),
    [
      action,
      accountOptions,
      categoryOptions,
      errorMessage,
      merchantOptions,
      tagOptions,
    ],
  );

  return (
    <Stack spacing={0}>
      <TransactionFormHeader
        closeHref={routePaths.transactions}
        formId={activeFormId}
        isSubmitDisabled={submitDisabledByType[activeType]}
        ledgerName={ledgerName}
        title="新增记账"
      />
      <TransactionTypeNavigation
        activeType={activeType}
        onChange={setActiveType}
      />
      <TransactionTypeSlidePanels activeType={activeType} panels={panels} />
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
  const [submitDisabledByType, setSubmitDisabledByType] = useState<
    Record<TransactionRecordType, boolean>
  >({ expense: true, income: true, transfer: true });

  const panels = useMemo(
    () => ({
      expense: (
        <>
          <input
            form="edit-expense-transaction-form"
            name="sourceType"
            readOnly
            type="hidden"
            value="transfer"
          />
          <TransactionForm
            action={action}
            accountOptions={accountOptions}
            categoryOptions={categoryOptions}
            errorMessage={errorMessage}
            formId="edit-expense-transaction-form"
            hideHeader
            initialValues={createNormalInitialValuesFromTransfer(
              initialValues,
              "expense",
            )}
            merchantOptions={merchantOptions}
            onSubmitDisabledChange={(disabled) =>
              setSubmitDisabledByType((prev) => ({
                ...prev,
                expense: disabled,
              }))
            }
            submitLabel="保存修改"
            tagOptions={tagOptions}
          />
        </>
      ),
      income: (
        <>
          <input
            form="edit-income-transaction-form"
            name="sourceType"
            readOnly
            type="hidden"
            value="transfer"
          />
          <TransactionForm
            action={action}
            accountOptions={accountOptions}
            categoryOptions={categoryOptions}
            errorMessage={errorMessage}
            formId="edit-income-transaction-form"
            hideHeader
            initialValues={createNormalInitialValuesFromTransfer(
              initialValues,
              "income",
            )}
            merchantOptions={merchantOptions}
            onSubmitDisabledChange={(disabled) =>
              setSubmitDisabledByType((prev) => ({ ...prev, income: disabled }))
            }
            submitLabel="保存修改"
            tagOptions={tagOptions}
          />
        </>
      ),
      transfer: (
        <TransferTransactionForm
          action={action}
          accountOptions={accountOptions}
          errorMessage={errorMessage}
          formId="edit-transfer-transaction-form"
          hideHeader
          initialValues={initialValues}
          onSubmitDisabledChange={(disabled) =>
            setSubmitDisabledByType((prev) => ({ ...prev, transfer: disabled }))
          }
          sourceType="transfer"
        />
      ),
    }),
    [
      action,
      accountOptions,
      categoryOptions,
      errorMessage,
      initialValues,
      merchantOptions,
      tagOptions,
    ],
  );

  const activeFormId = `edit-${activeType}-transaction-form`;
  const activeTitle = activeType === "transfer" ? "编辑转账" : "编辑记账";

  return (
    <PageShell>
      <Stack spacing={0}>
        <TransactionFormHeader
          closeHref={routePaths.transactions}
          formId={activeFormId}
          isSubmitDisabled={submitDisabledByType[activeType]}
          ledgerName={ledgerName}
          title={activeTitle}
        />
        <TransactionTypeNavigation
          activeType={activeType}
          onChange={setActiveType}
        />
        <TransactionTypeSlidePanels activeType={activeType} panels={panels} />
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
  const [submitDisabledByType, setSubmitDisabledByType] = useState<
    Record<TransactionRecordType, boolean>
  >({ expense: true, income: true, transfer: true });

  const panels = useMemo(
    () => ({
      expense: (
        <>
          <input
            form="edit-expense-transaction-form"
            name="sourceType"
            readOnly
            type="hidden"
            value={initialValues.type}
          />
          <TransactionForm
            action={action}
            accountOptions={accountOptions}
            categoryOptions={categoryOptions}
            errorMessage={errorMessage}
            formId="edit-expense-transaction-form"
            hideHeader
            initialValues={createNormalInitialValuesFromNormal(
              initialValues,
              "expense",
            )}
            merchantOptions={merchantOptions}
            onSubmitDisabledChange={(disabled) =>
              setSubmitDisabledByType((prev) => ({
                ...prev,
                expense: disabled,
              }))
            }
            submitLabel="保存修改"
            tagOptions={tagOptions}
          />
        </>
      ),
      income: (
        <>
          <input
            form="edit-income-transaction-form"
            name="sourceType"
            readOnly
            type="hidden"
            value={initialValues.type}
          />
          <TransactionForm
            action={action}
            accountOptions={accountOptions}
            categoryOptions={categoryOptions}
            errorMessage={errorMessage}
            formId="edit-income-transaction-form"
            hideHeader
            initialValues={createNormalInitialValuesFromNormal(
              initialValues,
              "income",
            )}
            merchantOptions={merchantOptions}
            onSubmitDisabledChange={(disabled) =>
              setSubmitDisabledByType((prev) => ({ ...prev, income: disabled }))
            }
            submitLabel="保存修改"
            tagOptions={tagOptions}
          />
        </>
      ),
      transfer: (
        <TransferTransactionForm
          action={action}
          accountOptions={accountOptions}
          errorMessage={errorMessage}
          formId="edit-transfer-transaction-form"
          hideHeader
          initialValues={createTransferInitialValuesFromNormal(
            initialValues,
            accountOptions,
          )}
          onSubmitDisabledChange={(disabled) =>
            setSubmitDisabledByType((prev) => ({ ...prev, transfer: disabled }))
          }
          sourceType={initialValues.type}
        />
      ),
    }),
    [
      action,
      accountOptions,
      categoryOptions,
      errorMessage,
      initialValues,
      merchantOptions,
      tagOptions,
    ],
  );

  const activeFormId = `edit-${activeType}-transaction-form`;
  const activeTitle = activeType === "transfer" ? "编辑转账" : "编辑记账";

  return (
    <PageShell>
      <Stack spacing={0}>
        <TransactionFormHeader
          closeHref={routePaths.transactions}
          formId={activeFormId}
          isSubmitDisabled={submitDisabledByType[activeType]}
          ledgerName={ledgerName}
          title={activeTitle}
        />
        <TransactionTypeNavigation
          activeType={activeType}
          onChange={setActiveType}
        />
        <TransactionTypeSlidePanels activeType={activeType} panels={panels} />
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
