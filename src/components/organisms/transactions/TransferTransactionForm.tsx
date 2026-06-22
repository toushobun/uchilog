"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { routePaths } from "config/paths";
import { TransactionDateTimePicker } from "molecules/transactions/TransactionDateTimePicker";
import type { TransactionAccountOption } from "types/transactions";
import {
  composeTransactionDateTimeLocalValue,
  getNowDateTimeLocalValue,
  splitDateTimeLocalValue,
} from "utils/transactions";

export type TransferTransactionFormInitialValues = {
  transactionRecordId: string;
  accountId: string;
  transferTargetAccountId: string;
  transferAmount: string;
  note: string;
  transactionAt: string;
};

type TransferTransactionFormProps = {
  action: (formData: FormData) => Promise<void>;
  accountOptions: TransactionAccountOption[];
  closeHref?: string;
  errorMessage?: string | null;
  hideHeader?: boolean;
  initialValues?: TransferTransactionFormInitialValues;
  ledgerName?: string;
  onSubmitDisabledChange?: (disabled: boolean) => void;
  title?: string;
  typeNavigation?: ReactNode;
};

type FieldErrors = {
  amount?: string;
  fromAccount?: string;
  toAccount?: string;
};

export function TransferTransactionForm({
  action,
  accountOptions,
  closeHref = routePaths.transactions,
  errorMessage,
  hideHeader = false,
  initialValues,
  ledgerName,
  onSubmitDisabledChange,
  title = "新增记账",
  typeNavigation,
}: TransferTransactionFormProps) {
  const [fromAccountId, setFromAccountId] = useState(
    () => initialValues?.accountId ?? "",
  );
  const [toAccountId, setToAccountId] = useState(
    () => initialValues?.transferTargetAccountId ?? "",
  );
  const [amount, setAmount] = useState(
    () => initialValues?.transferAmount ?? "",
  );
  const [note, setNote] = useState(() => initialValues?.note ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [transactionDate, setTransactionDate] = useState("");
  const [transactionTime, setTransactionTime] = useState("");
  const [timeZoneOffsetMinutes, setTimeZoneOffsetMinutes] = useState("");

  useEffect(() => {
    let dateTimeLocal: string;

    if (initialValues?.transactionAt) {
      // UTC ISO 转为客户端时区的 datetime-local 值。
      const date = new Date(initialValues.transactionAt);
      const y = date.getFullYear();
      const mo = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const h = String(date.getHours()).padStart(2, "0");
      const mi = String(date.getMinutes()).padStart(2, "0");
      const s = String(date.getSeconds()).padStart(2, "0");
      dateTimeLocal = `${y}-${mo}-${d}T${h}:${mi}:${s}`;
    } else {
      dateTimeLocal = getNowDateTimeLocalValue();
    }

    const nextDateTime = splitDateTimeLocalValue(dateTimeLocal);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- 客户端挂载后同步本地时区时间，避免服务端水合差异。
    setTransactionDate(nextDateTime.date);
    setTransactionTime(nextDateTime.time);
    setTimeZoneOffsetMinutes(String(new Date().getTimezoneOffset()));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fromAccount = accountOptions.find(
    (account) => account.id === fromAccountId,
  );
  const toAccount = accountOptions.find(
    (account) => account.id === toAccountId,
  );
  const transactionAtValue = composeTransactionDateTimeLocalValue(
    transactionDate,
    transactionTime,
  );
  const amountIsValid = isValidTransferAmount(amount);
  const currencyMismatch =
    !!fromAccount && !!toAccount && fromAccount.currency !== toAccount.currency;
  const archivedAccountSelected = Boolean(
    fromAccount?.isArchived || toAccount?.isArchived,
  );
  const isSubmitDisabled =
    accountOptions.length < 2 ||
    !transactionAtValue ||
    !fromAccountId ||
    !toAccountId ||
    !fromAccount ||
    !toAccount ||
    !amountIsValid ||
    currencyMismatch ||
    archivedAccountSelected;

  useEffect(() => {
    onSubmitDisabledChange?.(isSubmitDisabled);
  }, [isSubmitDisabled, onSubmitDisabledChange]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const errors: FieldErrors = {};

    if (!fromAccountId || !fromAccount) {
      errors.fromAccount = "请选择转出账户。";
    } else if (fromAccount.isArchived) {
      errors.fromAccount = "已归档账户不能用于保存转账。";
    }

    if (!toAccountId || !toAccount) {
      errors.toAccount = "请选择转入账户。";
    } else if (toAccountId === fromAccountId) {
      errors.toAccount = "转入账户不能和转出账户相同。";
    } else if (toAccount.isArchived) {
      errors.toAccount = "已归档账户不能用于保存转账。";
    } else if (currencyMismatch) {
      errors.toAccount = "当前只支持同币种账户转账。";
    }

    if (!amountIsValid) {
      errors.amount = "请输入大于 0 且最多两位小数的金额。";
    }

    if (!transactionAtValue || Object.keys(errors).length > 0) {
      event.preventDefault();
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
  }

  return (
    <form
      action={action}
      id="new-transfer-transaction-form"
      onSubmit={handleSubmit}
    >
      <Stack spacing={2.5}>
        {!hideHeader && (
          <Stack spacing={1}>
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Button
                component={Link}
                href={closeHref}
                variant="text"
                sx={{ color: "var(--user-theme-action-text)" }}
              >
                关闭
              </Button>
              <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
              <Button
                disabled={isSubmitDisabled}
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
        )}

        {typeNavigation}

        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

        {initialValues && (
          <input
            name="transactionRecordId"
            type="hidden"
            value={initialValues.transactionRecordId}
          />
        )}
        <input name="type" type="hidden" value="transfer" />
        <input
          name="timeZoneOffsetMinutes"
          readOnly
          type="hidden"
          value={timeZoneOffsetMinutes}
        />
        <input
          name="transactionAt"
          readOnly
          type="hidden"
          value={transactionAtValue}
        />

        <TextField
          disabled={accountOptions.length < 2}
          error={!!fieldErrors.fromAccount || !!fromAccount?.isArchived}
          fullWidth
          helperText={
            fieldErrors.fromAccount ??
            (fromAccount?.isArchived
              ? "已归档账户不能用于保存转账。"
              : accountOptions.length < 2
                ? "请至少新增两个账户后再记录转账。"
                : "选择扣款账户。")
          }
          label="转出账户"
          name="accountId"
          onChange={(event) => {
            setFromAccountId(event.target.value);
            if (fieldErrors.fromAccount) {
              setFieldErrors((prev) => ({
                ...prev,
                fromAccount: undefined,
              }));
            }
          }}
          select
          value={fromAccountId}
        >
          <MenuItem disabled value="">
            请选择转出账户
          </MenuItem>
          {accountOptions
            .filter((account) => account.id !== toAccountId)
            .map((account) => (
              <MenuItem
                disabled={account.isArchived}
                key={account.id}
                value={account.id}
              >
                {account.name}（{account.currency}）
              </MenuItem>
            ))}
        </TextField>

        <TextField
          disabled={accountOptions.length < 2}
          error={
            !!fieldErrors.toAccount ||
            !!toAccount?.isArchived ||
            currencyMismatch
          }
          fullWidth
          helperText={
            fieldErrors.toAccount ??
            (toAccount?.isArchived
              ? "已归档账户不能用于保存转账。"
              : currencyMismatch
                ? "当前只支持同币种账户转账。"
                : "选择收款账户。")
          }
          label="转入账户"
          name="transferTargetAccountId"
          onChange={(event) => {
            setToAccountId(event.target.value);
            if (fieldErrors.toAccount) {
              setFieldErrors((prev) => ({
                ...prev,
                toAccount: undefined,
              }));
            }
          }}
          select
          value={toAccountId}
        >
          <MenuItem disabled value="">
            请选择转入账户
          </MenuItem>
          {accountOptions
            .filter((account) => account.id !== fromAccountId)
            .map((account) => (
              <MenuItem
                disabled={account.isArchived}
                key={account.id}
                value={account.id}
              >
                {account.name}（{account.currency}）
              </MenuItem>
            ))}
        </TextField>

        <TextField
          error={!!fieldErrors.amount}
          fullWidth
          helperText={fieldErrors.amount ?? "输入本次转账金额。"}
          label="转账金额"
          name="transferAmount"
          onChange={(event) => {
            setAmount(event.target.value);
            if (fieldErrors.amount) {
              setFieldErrors((prev) => ({ ...prev, amount: undefined }));
            }
          }}
          placeholder="0"
          slotProps={{
            htmlInput: {
              "data-amount-currency": fromAccount?.currency ?? "",
              "data-amount-input": "true",
              inputMode: "decimal",
            },
          }}
          type="text"
          value={amount}
        />

        <TextField
          fullWidth
          label="备注"
          minRows={2}
          multiline
          name="note"
          onChange={(event) => setNote(event.target.value)}
          placeholder="可选"
          value={note}
        />

        <TransactionDateTimePicker
          date={transactionDate}
          onDateChange={setTransactionDate}
          onTimeChange={setTransactionTime}
          time={transactionTime}
        />

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Typography sx={{ fontWeight: 700 }} variant="subtitle1">
              保存前汇总
            </Typography>
            <SummaryRow
              label="转出"
              value={
                fromAccount
                  ? `${fromAccount.name}（${fromAccount.currency}）`
                  : "未选择"
              }
            />
            <SummaryRow
              label="转入"
              value={
                toAccount
                  ? `${toAccount.name}（${toAccount.currency}）`
                  : "未选择"
              }
            />
            <SummaryRow
              label="时间"
              value={formatSummaryDateTime(transactionDate, transactionTime)}
            />
            <Divider />
            <SummaryRow
              label="转账"
              strong
              value={
                amount
                  ? `${amount} ${fromAccount?.currency ?? ""}`.trim()
                  : "未填写"
              }
            />
          </Stack>
        </Paper>

        <Button
          disabled={isSubmitDisabled}
          size="large"
          sx={{
            "&:not(.Mui-disabled)": {
              background: "var(--user-theme-fab-bg)",
              color: "white",
            },
          }}
          type="submit"
          variant="contained"
        >
          保存转账
        </Button>
      </Stack>
    </form>
  );
}

function isValidTransferAmount(value: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return false;

  const amount = Number(value);

  return Number.isFinite(amount) && amount > 0;
}

function formatSummaryDateTime(date: string, time: string) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!dateMatch) return "未选择";

  const dateLabel = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
  const timeMatch = /^(\d{2}):(\d{2})(?::(\d{2}))?/.exec(time);
  const timeLabel = timeMatch
    ? `${timeMatch[1]}:${timeMatch[2]}:${timeMatch[3] ?? "00"}`
    : time.slice(0, 8);

  return `${dateLabel} ${timeLabel}`;
}

function SummaryRow({
  label,
  strong = false,
  value,
}: {
  label: string;
  strong?: boolean;
  value: string;
}) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: "center", justifyContent: "space-between" }}
    >
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography
        sx={{ fontWeight: strong ? 700 : 500, textAlign: "right" }}
        variant={strong ? "subtitle1" : "body2"}
      >
        {value}
      </Typography>
    </Stack>
  );
}
