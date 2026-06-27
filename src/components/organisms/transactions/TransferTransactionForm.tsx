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
import { outlinedInputTokenSx } from "molecules/ui/outlinedInputTokenSx";
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

import {
  transactionFieldGroupSx,
  transactionFormStackSx,
  transactionNoteFieldSx,
  transactionSectionTitleSx,
  transactionSubmitButtonSx,
  transactionSummarySurfaceSx,
} from "./TransactionForm.styles";

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
    submitLabel ?? (initialValues ? "保存修改" : "保存转账");

  return (
    <form id={formId} action={action} onSubmit={handleSubmit}>
      <Stack spacing={0} sx={transactionFormStackSx}>
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

        <Box ref={accountFieldRef} sx={transactionFieldGroupSx}>
          <TransferSectionTitle>转出账户</TransferSectionTitle>
          <TextField
            disabled={hasTooFewAccounts}
            error={!!fieldErrors.accountId}
            fullWidth
            helperText={fieldErrors.accountId ?? accountHelperText}
            label="转出账户"
            name="accountId"
            onChange={(e) => {
              setSelectedAccountId(e.target.value);
              if (fieldErrors.accountId) {
                setFieldErrors((prev) => ({ ...prev, accountId: undefined }));
              }
            }}
            select
            sx={transferSelectFieldSx}
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

        <Box ref={targetAccountFieldRef} sx={transactionFieldGroupSx}>
          <TransferSectionTitle>转入账户</TransferSectionTitle>
          <TextField
            disabled={hasTooFewAccounts}
            error={!!fieldErrors.targetAccountId}
            fullWidth
            helperText={fieldErrors.targetAccountId ?? accountHelperText}
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
            sx={transferSelectFieldSx}
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

        <Box ref={amountFieldRef} sx={transactionFieldGroupSx}>
          <TransferSectionTitle>转账金额</TransferSectionTitle>
          <TextField
            error={!!fieldErrors.transferAmount}
            fullWidth
            helperText={fieldErrors.transferAmount}
            hiddenLabel
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
                "aria-label": "金额",
                "data-amount-currency": sourceAccount?.currency ?? "",
                "data-amount-input": "true",
                inputMode: "decimal" as const,
              },
            }}
            sx={transferAmountFieldSx}
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

        <Box ref={noteFieldRef} sx={transactionFieldGroupSx}>
          <TransferSectionTitle>备注（可选）</TransferSectionTitle>
          <TextField
            error={isNoteTooLong}
            fullWidth
            helperText={
              isNoteTooLong
                ? `备注不能超过 ${maxNoteLength} 个字符。`
                : `${note.length} / ${maxNoteLength}`
            }
            hiddenLabel
            multiline
            name="note"
            onChange={(e) => setNote(e.target.value)}
            placeholder="记录这次转账的用途…"
            rows={1}
            slotProps={{ htmlInput: { "aria-label": "备注（选填）" } }}
            sx={transactionNoteFieldSx}
            value={note}
          />
        </Box>

        <Box sx={transactionSummarySurfaceSx}>
          <Stack spacing={1}>
            <Typography variant="subtitle1" sx={summaryTitleSx}>
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
              strong
            />
          </Stack>
        </Box>

        <Button
          disabled={isSubmitDisabled}
          size="large"
          type="submit"
          variant="contained"
          sx={transactionSubmitButtonSx}
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

function TransferSectionTitle({ children }: { children: ReactNode }) {
  return <Typography sx={transactionSectionTitleSx}>{children}</Typography>;
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
      <Typography color="text.secondary" sx={summaryLabelSx}>
        {label}
      </Typography>
      <Typography
        sx={{
          color: strong ? "var(--user-theme-tx-accent)" : "text.primary",
          fontSize: strong ? "0.9375rem" : "0.75rem",
          fontWeight: strong ? 800 : 500,
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

const transferSelectFieldSx = {
  ...outlinedInputTokenSx,
  "& .MuiInputLabel-root": {
    clip: "rect(0 0 0 0)",
    height: 1,
    m: -1,
    overflow: "hidden",
    p: 0,
    position: "absolute",
    width: 1,
  },
  "& .MuiOutlinedInput-root": {
    ...outlinedInputTokenSx["& .MuiOutlinedInput-root"],
    minHeight: 50,
  },
  "& legend": { display: "none" },
};

const transferAmountFieldSx = {
  ...outlinedInputTokenSx,
  "& .MuiOutlinedInput-input": {
    fontSize: "1.25rem",
    fontWeight: 700,
    py: 1.25,
  },
};

const summaryTitleSx = {
  fontSize: "0.8125rem",
  fontWeight: 800,
};

const summaryLabelSx = {
  fontSize: "0.75rem",
};
