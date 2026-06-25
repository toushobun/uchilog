"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { routePaths } from "config/paths";
import { TransactionFormHeader } from "organisms/transactions/TransactionFormHeader";
import { TransactionDateTimePicker } from "molecules/transactions/TransactionDateTimePicker";
import { SectionCard } from "molecules/ui/SectionCard";
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

type TransferFieldErrors = {
  accountId?: string;
  targetAccountId?: string;
  transferAmount?: string;
};

type TransferTransactionFormProps = {
  action: (formData: FormData) => Promise<void>;
  accountOptions: TransactionAccountOption[];
  errorMessage?: string | null;
  formId?: string;
  hideHeader?: boolean;
  initialValues?: TransferEditInitialValues;
  ledgerName?: string;
  onSubmitDisabledChange?: (disabled: boolean) => void;
  sourceType?: TransactionRecordType;
  submitLabel?: string;
  title?: string;
  typeNavigation?: ReactNode;
};

export function TransferTransactionForm({
  action,
  accountOptions,
  errorMessage,
  formId,
  hideHeader = false,
  initialValues,
  ledgerName,
  onSubmitDisabledChange,
  sourceType,
  submitLabel,
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
  const [fieldErrors, setFieldErrors] = useState<TransferFieldErrors>({});
  const accountFieldRef = useRef<HTMLDivElement>(null);
  const targetAccountFieldRef = useRef<HTMLDivElement>(null);
  const amountFieldRef = useRef<HTMLDivElement>(null);
  const noteFieldRef = useRef<HTMLDivElement>(null);

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
    hasTooFewAccounts || !transactionAtValue || !timeZoneOffsetMinutes;

  useEffect(() => {
    onSubmitDisabledChange?.(isSubmitDisabled);
  }, [isSubmitDisabled, onSubmitDisabledChange]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!transactionAtValue) {
      event.preventDefault();
      return;
    }

    const errors: TransferFieldErrors = {};

    if (!selectedAccountId) {
      errors.accountId = "请选择转出账户。";
    }
    if (!selectedTargetAccountId) {
      errors.targetAccountId = "请选择转入账户。";
    }
    if (isAmountInvalid) {
      errors.transferAmount = "请输入有效金额。";
    }

    const hasErrors =
      Object.keys(errors).length > 0 ||
      isSameAccount ||
      isDifferentCurrency ||
      isNoteTooLong;

    if (hasErrors) {
      event.preventDefault();
      setFieldErrors(errors);
      setTimeout(() => {
        const firstRef = errors.accountId
          ? accountFieldRef
          : errors.targetAccountId || isSameAccount || isDifferentCurrency
            ? targetAccountFieldRef
            : errors.transferAmount
              ? amountFieldRef
              : noteFieldRef;
        firstRef.current?.scrollIntoView?.({
          behavior: "smooth",
          block: "center",
        });
      }, 0);
    } else {
      setFieldErrors({});
    }
  }

  const accountHelperText = hasTooFewAccounts
    ? "请先新增至少两个账户。"
    : undefined;
  const effectiveSubmitLabel =
    submitLabel ?? (initialValues ? "保存修改" : "保存记账");

  return (
    <form id={formId} action={action} onSubmit={handleSubmit}>
      <Stack spacing={2.5}>
        {hideHeader ? null : (
          <TransactionFormHeader
            closeHref={routePaths.transactions}
            isSubmitDisabled={isSubmitDisabled}
            ledgerName={ledgerName}
            title={title}
          />
        )}

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

        <Box ref={accountFieldRef}>
          <TextField
            disabled={hasTooFewAccounts}
            error={!!fieldErrors.accountId}
            fullWidth
            helperText={
              fieldErrors.accountId ?? accountHelperText ?? "选择转出账户。"
            }
            label="转出账户"
            name="accountId"
            onChange={(e) => {
              setSelectedAccountId(e.target.value);
              if (fieldErrors.accountId) {
                setFieldErrors((prev) => ({ ...prev, accountId: undefined }));
              }
            }}
            select
            sx={transferFieldSx}
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
        </Box>

        <Box ref={targetAccountFieldRef}>
          <TextField
            disabled={hasTooFewAccounts}
            error={!!fieldErrors.targetAccountId}
            fullWidth
            helperText={
              fieldErrors.targetAccountId ??
              accountHelperText ??
              "选择转入账户。"
            }
            label="转入账户"
            name="transferTargetAccountId"
            onChange={(e) => {
              setSelectedTargetAccountId(e.target.value);
              if (fieldErrors.targetAccountId) {
                setFieldErrors((prev) => ({
                  ...prev,
                  targetAccountId: undefined,
                }));
              }
            }}
            select
            sx={transferFieldSx}
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
        </Box>

        <Box ref={amountFieldRef}>
          <TextField
            error={!!fieldErrors.transferAmount}
            fullWidth
            helperText={fieldErrors.transferAmount}
            label="金额"
            name="transferAmount"
            onChange={(e) => {
              setTransferAmount(e.target.value);
              if (fieldErrors.transferAmount) {
                setFieldErrors((prev) => ({
                  ...prev,
                  transferAmount: undefined,
                }));
              }
            }}
            placeholder="0"
            slotProps={{
              htmlInput: {
                "data-amount-currency": sourceAccount?.currency ?? "",
                "data-amount-input": "true",
                inputMode: "decimal" as const,
              },
            }}
            sx={transferFieldSx}
            type="text"
            value={transferAmount}
          />
        </Box>

        <TransactionDateTimePicker
          date={transactionDate}
          onDateChange={setTransactionDate}
          onTimeChange={setTransactionTime}
          time={transactionTime}
        />

        <Box ref={noteFieldRef}>
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
            sx={transferFieldSx}
            value={note}
          />
        </Box>

        <SectionCard sx={{ p: 2 }}>
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
        </SectionCard>

        <Button
          disabled={isSubmitDisabled}
          size="large"
          type="submit"
          variant="contained"
          sx={{
            "&:not(.Mui-disabled)": {
              background: "var(--user-theme-fab-bg)",
              color: "var(--user-theme-fab-text)",
            },
          }}
        >
          {effectiveSubmitLabel}
        </Button>
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

const transferFieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "var(--user-theme-card-bg)",
    borderRadius: 1.5,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--user-theme-card-border)",
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--user-theme-field-card-selected-border)",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--user-theme-field-card-selected-border)",
    borderWidth: 1,
  },
};
