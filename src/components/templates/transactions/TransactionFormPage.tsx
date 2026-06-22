"use client";

import { useEffect, useRef, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { routePaths } from "config/paths";
import { TransactionTypeNavigation } from "molecules/transactions/TransactionTypeNavigation";
import { TransactionAmountKeypadLauncher } from "organisms/transactions/TransactionAmountKeypadLauncher";
import {
  TransactionForm,
  type TransactionFormInitialValues,
} from "organisms/transactions/TransactionForm";
import {
  TransferTransactionForm,
  type TransferTransactionFormInitialValues,
} from "organisms/transactions/TransferTransactionForm";
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

const newTransactionTabOrder: Record<TransactionRecordType, number> = {
  expense: 0,
  income: 1,
  transfer: 2,
};

const editTransactionTabOrder: Record<TransactionType, number> = {
  expense: 0,
  income: 1,
};

const incomeInitialValues: TransactionFormInitialValues = {
  accountId: "",
  items: [],
  merchantId: "",
  note: "",
  tagNames: [],
  transactionAt: "",
  type: "income",
};

export function NewTransactionTemplate({
  accountOptions,
  action,
  categoryOptions,
  errorMessage,
  initialType = "expense",
  ledgerName,
  merchantOptions,
  tagOptions,
}: TransactionFormTemplateProps) {
  const [activeTab, setActiveTab] =
    useState<TransactionRecordType>(initialType);
  const [transferSubmitDisabled, setTransferSubmitDisabled] = useState(true);
  const [activePanelHeight, setActivePanelHeight] = useState<number | null>(
    null,
  );
  const expensePanelRef = useRef<HTMLDivElement>(null);
  const incomePanelRef = useRef<HTMLDivElement>(null);
  const transferPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPanelInert(expensePanelRef.current, activeTab !== "expense");
    setPanelInert(incomePanelRef.current, activeTab !== "income");
    setPanelInert(transferPanelRef.current, activeTab !== "transfer");
  }, [activeTab]);

  useEffect(() => {
    const element = getNewTransactionPanelElement(activeTab, {
      expense: expensePanelRef.current,
      income: incomePanelRef.current,
      transfer: transferPanelRef.current,
    });

    if (!element) return;

    const updateHeight = () => setActivePanelHeight(element.offsetHeight);
    updateHeight();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => observer.disconnect();
  }, [activeTab]);

  function handleTabChange(newTab: TransactionRecordType) {
    if (newTab === activeTab) return;
    setActiveTab(newTab);
  }

  const activeFormId =
    activeTab === "expense"
      ? "expense-transaction-form"
      : activeTab === "income"
        ? "income-transaction-form"
        : "new-transfer-transaction-form";
  const activeCategoryType: TransactionType | null =
    activeTab === "transfer" ? null : activeTab;
  const hasActiveCategoryOptions = activeCategoryType
    ? categoryOptions.some((category) => category.type === activeCategoryType)
    : false;

  const isTopSaveDisabled =
    activeTab === "transfer"
      ? transferSubmitDisabled
      : accountOptions.length === 0 ||
        merchantOptions.length === 0 ||
        !hasActiveCategoryOptions;

  return (
    <PageShell>
      <Stack spacing={2.5}>
        <TransactionFormHeader
          formId={activeFormId}
          isSaveDisabled={isTopSaveDisabled}
          ledgerName={ledgerName}
          title="新增记账"
        />

        <TransactionTypeNavigation
          value={activeTab}
          onChange={handleTabChange}
        />

        <Box
          sx={{
            height: activePanelHeight ?? "auto",
            overflow: "hidden",
            transition: activePanelHeight ? "height 0.2s ease" : undefined,
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              transform: `translateX(calc(-${newTransactionTabOrder[activeTab]} / 3 * 100%))`,
              transition:
                "transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              width: "300%",
              willChange: "transform",
            }}
          >
            <div
              ref={expensePanelRef}
              aria-hidden={activeTab !== "expense"}
              data-testid="expense-transaction-panel"
              style={getPanelStyle(activeTab === "expense", 3)}
            >
              <TransactionForm
                action={action}
                accountOptions={accountOptions}
                categoryOptions={categoryOptions}
                errorMessage={errorMessage}
                formId="expense-transaction-form"
                hideHeader
                initialValues={undefined}
                ledgerName={ledgerName}
                merchantOptions={merchantOptions}
                tagOptions={tagOptions}
              />
            </div>
            <div
              ref={incomePanelRef}
              aria-hidden={activeTab !== "income"}
              data-testid="income-transaction-panel"
              style={getPanelStyle(activeTab === "income", 3)}
            >
              <TransactionForm
                action={action}
                accountOptions={accountOptions}
                categoryOptions={categoryOptions}
                errorMessage={errorMessage}
                formId="income-transaction-form"
                hideHeader
                initialValues={incomeInitialValues}
                ledgerName={ledgerName}
                merchantOptions={merchantOptions}
                tagOptions={tagOptions}
              />
            </div>
            <div
              ref={transferPanelRef}
              aria-hidden={activeTab !== "transfer"}
              data-testid="transfer-transaction-panel"
              style={getPanelStyle(activeTab === "transfer", 3)}
            >
              <TransferTransactionForm
                action={action}
                accountOptions={accountOptions}
                errorMessage={errorMessage}
                hideHeader
                ledgerName={ledgerName}
                onSubmitDisabledChange={setTransferSubmitDisabled}
              />
            </div>
          </Box>
        </Box>
      </Stack>
      <TransactionAmountKeypadLauncher />
    </PageShell>
  );
}

export type EditTransferTransactionTemplateProps = {
  accountOptions: TransactionAccountOption[];
  action: (formData: FormData) => Promise<void>;
  errorMessage: string | null;
  initialValues: TransferTransactionFormInitialValues;
  ledgerName: string;
};

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
        closeHref={routePaths.transactions}
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
  const [activeType, setActiveType] = useState<TransactionType>(
    initialValues.type,
  );
  const [activePanelHeight, setActivePanelHeight] = useState<number | null>(
    null,
  );
  const expensePanelRef = useRef<HTMLDivElement>(null);
  const incomePanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPanelInert(expensePanelRef.current, activeType !== "expense");
    setPanelInert(incomePanelRef.current, activeType !== "income");
  }, [activeType]);

  useEffect(() => {
    const element =
      activeType === "expense"
        ? expensePanelRef.current
        : incomePanelRef.current;

    if (!element) return;

    const updateHeight = () => setActivePanelHeight(element.offsetHeight);
    updateHeight();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => observer.disconnect();
  }, [activeType]);

  const activeFormId =
    activeType === "expense"
      ? "edit-expense-transaction-form"
      : "edit-income-transaction-form";
  const hasActiveCategoryOptions = categoryOptions.some(
    (category) => category.type === activeType,
  );
  const isTopSaveDisabled =
    accountOptions.length === 0 ||
    merchantOptions.length === 0 ||
    !hasActiveCategoryOptions;

  return (
    <PageShell>
      <Stack spacing={2.5}>
        <TransactionFormHeader
          formId={activeFormId}
          isSaveDisabled={isTopSaveDisabled}
          ledgerName={ledgerName}
          title="编辑记账"
        />

        <TransactionEditTypeNavigation
          value={activeType}
          onChange={setActiveType}
        />

        <Box
          sx={{
            height: activePanelHeight ?? "auto",
            overflow: "hidden",
            transition: activePanelHeight ? "height 0.2s ease" : undefined,
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              transform: `translateX(calc(-${editTransactionTabOrder[activeType]} / 2 * 100%))`,
              transition:
                "transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              width: "200%",
              willChange: "transform",
            }}
          >
            <div
              ref={expensePanelRef}
              aria-hidden={activeType !== "expense"}
              data-testid="edit-expense-transaction-panel"
              style={getPanelStyle(activeType === "expense", 2)}
            >
              <TransactionForm
                action={action}
                accountOptions={accountOptions}
                categoryOptions={categoryOptions}
                errorMessage={errorMessage}
                formId="edit-expense-transaction-form"
                hideHeader
                initialValues={createEditInitialValuesForType(
                  initialValues,
                  "expense",
                )}
                ledgerName={ledgerName}
                merchantOptions={merchantOptions}
                submitLabel="保存修改"
                tagOptions={tagOptions}
              />
            </div>
            <div
              ref={incomePanelRef}
              aria-hidden={activeType !== "income"}
              data-testid="edit-income-transaction-panel"
              style={getPanelStyle(activeType === "income", 2)}
            >
              <TransactionForm
                action={action}
                accountOptions={accountOptions}
                categoryOptions={categoryOptions}
                errorMessage={errorMessage}
                formId="edit-income-transaction-form"
                hideHeader
                initialValues={createEditInitialValuesForType(
                  initialValues,
                  "income",
                )}
                ledgerName={ledgerName}
                merchantOptions={merchantOptions}
                submitLabel="保存修改"
                tagOptions={tagOptions}
              />
            </div>
          </Box>
        </Box>
      </Stack>
      <TransactionAmountKeypadLauncher />
    </PageShell>
  );
}

function TransactionFormHeader({
  formId,
  isSaveDisabled,
  ledgerName,
  title,
}: {
  formId: string;
  isSaveDisabled: boolean;
  ledgerName: string;
  title: string;
}) {
  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Button
          component={Link}
          href={routePaths.transactions}
          variant="text"
          sx={{ color: "var(--user-theme-action-text)" }}
        >
          关闭
        </Button>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Button
          disabled={isSaveDisabled}
          form={formId}
          type="submit"
          variant="contained"
          sx={{
            "&:not(.Mui-disabled)": {
              background: "var(--user-theme-fab-bg)",
              color: "white",
            },
          }}
        >
          保存
        </Button>
      </Stack>
      {ledgerName ? (
        <Typography
          color="text.secondary"
          sx={{ textAlign: "center" }}
          variant="body2"
        >
          当前账本：{ledgerName}
        </Typography>
      ) : null}
    </Stack>
  );
}

function TransactionEditTypeNavigation({
  onChange,
  value,
}: {
  onChange: (type: TransactionType) => void;
  value: TransactionType;
}) {
  return (
    <ToggleButtonGroup
      aria-label="编辑记账类型"
      exclusive
      fullWidth
      onChange={(_, newValue: unknown) => {
        if (newValue === "expense" || newValue === "income") {
          onChange(newValue);
        }
      }}
      value={value}
      sx={selectedToggleButtonGroupSx}
    >
      <ToggleButton value="expense">支出</ToggleButton>
      <ToggleButton value="income">收入</ToggleButton>
    </ToggleButtonGroup>
  );
}

function createEditInitialValuesForType(
  initialValues: TransactionFormInitialValues,
  type: TransactionType,
): TransactionFormInitialValues {
  return {
    ...initialValues,
    items: initialValues.type === type ? initialValues.items : [],
    type,
  };
}

function getNewTransactionPanelElement(
  activeTab: TransactionRecordType,
  elements: Record<TransactionRecordType, HTMLDivElement | null>,
) {
  return elements[activeTab];
}

function getPanelStyle(active: boolean, panelCount: number) {
  return {
    flexShrink: 0,
    pointerEvents: active ? "auto" : "none",
    width: `${100 / panelCount}%`,
  } as const;
}

function setPanelInert(element: HTMLElement | null, inert: boolean) {
  if (!element) return;

  if (inert) {
    element.setAttribute("inert", "");
  } else {
    element.removeAttribute("inert");
  }
}

const selectedToggleButtonGroupSx = {
  "& .MuiToggleButton-root.Mui-selected": {
    backgroundColor: "var(--user-theme-bottom-nav-active-bg)",
    color: "var(--user-theme-action-text)",
  },
  "& .MuiToggleButton-root.Mui-selected:hover": {
    backgroundColor: "var(--user-theme-bottom-nav-active-bg)",
  },
};
