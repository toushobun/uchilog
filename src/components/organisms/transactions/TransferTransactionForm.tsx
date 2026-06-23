"use client";

import { useEffect, useState, type ReactNode } from "react";

import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { routePaths } from "config/paths";
import { TransactionFormHeader } from "organisms/transactions/TransactionFormHeader";
import { TransactionDateTimePicker } from "molecules/transactions/TransactionDateTimePicker";
import type { TransferEditInitialValues } from "server/loaders/transactionForm";
import type {
  TransactionAccountOption,
  TransactionRecordType,
} from "types/transactions";
import {
  composeTransactionDateTimeLocalValue,
  formatDateTimeLocalInputValue,
  getNowDateTimeLocalValue,
  splitDateTimeLocalValue,
} from "utils/transactions";
import { isValidPositiveMoneyText } from "utils/transactionAmountInput";

const maxNoteLength = 2000;

type TransferTransactionFormProps = {
  action: (formData: FormData) => Promise<void>;
  accountOptions: TransactionAccountOption[];
  errorMessage?: string | null;
  formId?: string;
  initialValues?: TransferEditInitialValues;
  ledgerName?: string;
  sourceType?: TransactionRecordType;
  title?: string;
  typeNavigation?: ReactNode;
};

export function TransferTransactionForm({
  action,
  accountOptions,
  errorMessage,
  formId,
  initialValues,
  ledgerName,
  sourceType,
  title = "新增记账",
  typeNavigation,
}: TransferTransactionFormProps) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    initialValues?.accountId ?? "",
  );
  const [selectedTargetAccountId, setSelectedTargetAccountId] = useState(
    initialValues?.transferTargetAccountId ?? "",
  );
  const [transferAmount, setTransferAmount] = useState(
    initialValues?.transferAmount ?? "",
  );
  const [note, setNote] = useState(initialValues?.note ?? "");
  const [transactionDate, setTransactionDate] = useState("");
  const [transactionTime, setTransactionTime] = useState("");
  const [timeZoneOffsetMinutes, setTimeZoneOffsetMinutes] = useState("");

  useEffect(() => {
    const localValue = initialValues?.transactionAt
      ? formatDateTimeLocalInputValue(initialValues.transactionAt)
      : getNowDateTimeLocalValue();
    const { date, time } = splitDateTimeLocalValue(localValue);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 客户端挂载后同步本地时区时间，避免服务端水合差异。
    setTransactionDate(date);
    setTransactionTime(time);
    setTimeZoneOffsetMinutes(String(new Date().getTimezoneOffset()));
  }, [initialValues?.transactionAt]);

  const transactionAtValue = composeTransactionDateTimeLocalValue(
    transactionDate,
    transactionTime,
  );

  const sourceAccount = accountOptions.find((a) => a.id === selectedAccountId);
  const targetAccount = accountOptions.find(
    (a) => a.id === selectedTargetAccountId,
  );

  const hasTooFewAccounts = accountOptions.length < 2;
  const isSameAccount =
    !!selectedAccountId &&
    !!selectedTargetAccountId &&
    selectedAccountId === selectedTargetAccountId;
  const isDifferentCurrency =
    !!sourceAccount &&
    !!targetAccount &&
    sourceAccount.currency !== targetAccount.currency;
  const isAmountInvalid = !isValidPositiveMoneyText(transferAmount);
  const isNoteTooLong = note.length > maxNoteLength;

  const isSubmitDisabled =
    hasTooFewAccounts ||
    isSameAccount ||
    isDifferentCurrency ||
    isAmountInvalid ||
    isNoteTooLong ||
    !transactionAtValue ||
    !timeZoneOffsetMinutes;

  const accountHelperText = hasTooFewAccounts
    ? "请先新增至少两个账户。"
    : undefined;

  return (
    <form id={formId} action={action}>
      <Stack spacing={2.5}>
        <TransactionFormHeader
          closeHref={routePaths.transactions}
          isSubmitDisabled={isSubmitDisabled}
          ledgerName={ledgerName}
          title={title}
        />

        {typeNavigation}

        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

        {isSameAccount ? (
          <Alert severity="warning">转出账户和转入账户不能相同。</Alert>
        ) : isDifferentCurrency ? (
          <Alert severity="warning">暂不支持不同币种之间的转账。</Alert>
        ) : null}

        <input name="type" readOnly type="hidden" value="transfer" />
        <input name="targetType" readOnly type="hidden" value="transfer" />
        {sourceType ? (
          <input name="sourceType" readOnly type="hidden" value={sourceType} />
        ) : null}
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
        {initialValues?.transactionRecordId ? (
          <input
            name="transactionRecordId"
            readOnly
            type="hidden"
            value={initialValues.transactionRecordId}
          />
        ) : null}

        <TextField
          disabled={hasTooFewAccounts}
          fullWidth
          helperText={accountHelperText ?? "选择转出账户。"}
          label="转出账户"
          name="accountId"
          onChange={(e) => setSelectedAccountId(e.target.value)}
          select
          value={selectedAccountId}
        >
          <MenuItem disabled value="">
            请选择账户
          </MenuItem>
          {accountOptions.map((account) => (
            <MenuItem key={account.id} value={account.id}>
              {account.name}（{account.currency}）
            </MenuItem>
          ))}
        </TextField>

        <TextField
          disabled={hasTooFewAccounts}
          fullWidth
          helperText={accountHelperText ?? "选择转入账户。"}
          label="转入账户"
          name="transferTargetAccountId"
          onChange={(e) => setSelectedTargetAccountId(e.target.value)}
          select
          value={selectedTargetAccountId}
        >
          <MenuItem disabled value="">
            请选择账户
          </MenuItem>
          {accountOptions.map((account) => (
            <MenuItem key={account.id} value={account.id}>
              {account.name}（{account.currency}）
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="金额"
          name="transferAmount"
          onChange={(e) => setTransferAmount(e.target.value)}
          placeholder="0"
          slotProps={{
            htmlInput: {
              "data-amount-currency": sourceAccount?.currency ?? "",
              "data-amount-input": "true",
              inputMode: "decimal" as const,
            },
          }}
          type="text"
          value={transferAmount}
        />

        <TransactionDateTimePicker
          date={transactionDate}
          onDateChange={setTransactionDate}
          onTimeChange={setTransactionTime}
          time={transactionTime}
        />

        <TextField
          error={isNoteTooLong}
          fullWidth
          helperText={
            isNoteTooLong
              ? `备注不能超过 ${maxNoteLength} 个字符。`
              : `${note.length} / ${maxNoteLength}`
          }
          label="备注（选填）"
          multiline
          name="note"
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          value={note}
        />

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              保存前汇总
            </Typography>
            <SummaryRow
              label="转出账户"
              value={
                sourceAccount
                  ? `${sourceAccount.name}（${sourceAccount.currency}）`
                  : "未选择"
              }
            />
            <SummaryRow
              label="转入账户"
              value={
                targetAccount
                  ? `${targetAccount.name}（${targetAccount.currency}）`
                  : "未选择"
              }
            />
            <SummaryRow
              label="时间"
              value={formatSummaryDateTime(transactionDate, transactionTime)}
            />
            <Divider />
            <SummaryRow
              label="转账金额"
              value={transferAmount || "未填写金额"}
            />
          </Stack>
        </Paper>
      </Stack>
    </form>
  );
}

function formatSummaryDateTime(date: string, time: string) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!dateMatch) return "未选择";

  const dateLabel = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
  const timeMatch = /^(\d{2}):(\d{2})(?::(\d{2}))?/.exec(time);
  if (!timeMatch) return "未选择";

  return `${dateLabel} ${timeMatch[1]}:${timeMatch[2]}:${timeMatch[3] ?? "00"}`;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: "center", justifyContent: "space-between" }}
    >
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 500, textAlign: "right" }} variant="body2">
        {value}
      </Typography>
    </Stack>
  );
}
