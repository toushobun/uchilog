"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { routePaths } from "config/paths";
import { TransactionAmountKeypadLauncher } from "organisms/transactions/TransactionAmountKeypadLauncher";
import {
  TransactionForm,
  type TransactionFormInitialValues,
} from "organisms/transactions/TransactionForm";
import { TransferTransactionForm } from "organisms/transactions/TransferTransactionForm";
import type { TransferEditInitialValues } from "server/loaders/transactionForm";
import { SegmentTabs } from "molecules/ui/SegmentTabs";
import type {
  TransactionAccountOption,
  TransactionCategoryOption,
  TransactionMerchantOption,
  TransactionRecordType,
  TransactionTagOption,
  TransactionType,
} from "types/transactions";

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

const transactionTypeTabs = [
  { label: "收支", value: "normal" },
  { label: "转账", value: "transfer" },
] as const;

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
    <>
      <NewTransactionFormView {...props} />
      <TransactionAmountKeypadLauncher />
    </>
  );
}

function NewTransactionFormView({
  accountOptions,
  action,
  categoryOptions,
  errorMessage,
  initialType,
  merchantOptions,
  tagOptions,
}: TransactionFormTemplateProps) {
  const [activeType, setActiveType] = useState<TransactionRecordType>(
    initialType ?? "expense",
  );
  const lastNormalTypeRef = useRef<TransactionType>(
    initialType === "income" ? "income" : "expense",
  );
  if (activeType !== "transfer") {
    lastNormalTypeRef.current = activeType;
  }
  const [, setSubmitDisabledByType] = useState<
    Record<TransactionRecordType, boolean>
  >({ expense: true, income: true, transfer: true });

  function handleNewTypeChange(type: NewTransactionTypeTab) {
    if (type === "normal") {
      setActiveType(lastNormalTypeRef.current);
      return;
    }

    setActiveType("transfer");
  }

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
      <TransactionPageTopBar title="记一笔" />
      <NewTransactionTypeNavigation
        activeType={activeType === "transfer" ? "transfer" : "normal"}
        onChange={handleNewTypeChange}
      />
      <TransactionTypeSlidePanels activeType={activeType} panels={panels} />
    </Stack>
  );
}

function TransactionPageTopBar({ title }: { title: string }) {
  return (
    <Box sx={newTransactionTopBarSx}>
      <IconButton
        aria-label="关闭"
        component={Link}
        href={routePaths.transactions}
        sx={newTransactionCloseButtonSx}
      >
        <ArrowBackRoundedIcon />
      </IconButton>
      <Typography component="h1" variant="h5" sx={newTransactionTitleSx}>
        {title}
      </Typography>
      <Box aria-hidden sx={{ width: 40 }} />
    </Box>
  );
}

type NewTransactionTypeTab = "normal" | "transfer";

type NewTransactionTypeNavigationProps = {
  activeType: NewTransactionTypeTab;
  onChange: (type: NewTransactionTypeTab) => void;
};

function NewTransactionTypeNavigation({
  activeType,
  onChange,
}: NewTransactionTypeNavigationProps) {
  return (
    <SegmentTabs
      ariaLabel="记账类型"
      items={transactionTypeTabs}
      value={activeType}
      onChange={(value) => {
        if (value === "normal" || value === "transfer") onChange(value);
      }}
    />
  );
}

const newTransactionTopBarSx = {
  alignItems: "center",
  display: "grid",
  gridTemplateColumns: "40px minmax(0, 1fr) 40px",
  pb: 1.5,
  pt: { xs: 0, sm: 0.5 },
};

const newTransactionCloseButtonSx = {
  color: "text.secondary",
  justifySelf: "start",
  "&:hover": {
    bgcolor: "action.hover",
  },
};

const newTransactionTitleSx = {
  color: "text.primary",
  fontSize: "1rem",
  fontWeight: 800,
  letterSpacing: 0,
  lineHeight: 1.25,
  textAlign: "center",
};

type EditTransactionShellProps = {
  activeType: TransactionRecordType;
  panels: Record<TransactionRecordType, ReactNode>;
  setActiveType: (type: TransactionRecordType) => void;
};

function EditTransactionShell({
  activeType,
  panels,
  setActiveType,
}: EditTransactionShellProps) {
  const lastNormalTypeRef = useRef<TransactionType>(
    activeType !== "transfer" ? activeType : "expense",
  );

  if (activeType !== "transfer") {
    lastNormalTypeRef.current = activeType;
  }

  const outerTab: "normal" | "transfer" =
    activeType === "transfer" ? "transfer" : "normal";

  function handleOuterTabChange(tab: "normal" | "transfer") {
    setActiveType(tab === "transfer" ? "transfer" : lastNormalTypeRef.current);
  }

  return (
    <>
      <Stack spacing={0}>
        <TransactionPageTopBar title="编辑记账" />
        <NewTransactionTypeNavigation
          activeType={outerTab}
          onChange={handleOuterTabChange}
        />
        <TransactionTypeSlidePanels activeType={activeType} panels={panels} />
      </Stack>
      <TransactionAmountKeypadLauncher />
    </>
  );
}

export function EditTransferTransactionTemplate({
  accountOptions,
  action,
  categoryOptions,
  errorMessage,
  initialValues,
  merchantOptions,
  tagOptions,
}: EditTransferTransactionTemplateProps) {
  const [activeType, setActiveType] =
    useState<TransactionRecordType>("transfer");

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

  return (
    <EditTransactionShell
      activeType={activeType}
      panels={panels}
      setActiveType={setActiveType}
    />
  );
}

export function EditTransactionTemplate({
  accountOptions,
  action,
  categoryOptions,
  errorMessage,
  initialValues,
  merchantOptions,
  tagOptions,
}: EditTransactionTemplateProps) {
  const [activeType, setActiveType] = useState<TransactionRecordType>(
    initialValues.type,
  );

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

  return (
    <EditTransactionShell
      activeType={activeType}
      panels={panels}
      setActiveType={setActiveType}
    />
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
