"use client";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const incomeColor = "#d64b4b";
const expenseColor = "#3f7f46";
const primaryPurple = "#6d4bb3";
const avatarBackground = "#f4efff";

export type CategorySummaryItem = {
  categoryName: string;
  parentCategoryName: string | null;
  amount: string;
};

export type TransactionRowItem = {
  id: string;
  type: "expense" | "income";
  transaction_at: string;
  amount: string;
  account_name: string;
  account_currency: string;
  categoryItems: CategorySummaryItem[];
  merchant_name: string | null;
  merchant_icon_url: string | null;
  note?: string | null;
  recorder_name?: string | null;
};

export type TransactionRowProps = {
  item: TransactionRowItem;
  /** 显示收入/支出标签 chip */
  showType?: boolean;
  /** 显示备注 */
  showNote?: boolean;
  /** 显示账户名称 */
  showAccount?: boolean;
  /** 显示交易时间 */
  showTime?: boolean;
  /** 显示记账人名字 */
  showRecorder?: boolean;
  /** 传入后显示撤销按钮 */
  voidAction?: (formData: FormData) => void;
};

function formatNumber(amount: string) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return amount;

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

export function getCategoryLabel(items: CategorySummaryItem[]): string | null {
  if (items.length === 0) return null;
  const top = items.reduce((a, b) =>
    Number(a.amount) >= Number(b.amount) ? a : b,
  );
  const label = top.parentCategoryName
    ? `${top.parentCategoryName}·${top.categoryName}`
    : top.categoryName;
  return items.length >= 2 ? `${label}等` : label;
}

function getMerchantInitial(name: string | null) {
  return name?.trim().charAt(0).toUpperCase() || "记";
}

export function TransactionRow({
  item,
  showType = false,
  showNote = false,
  showAccount = false,
  showTime = false,
  showRecorder = false,
  voidAction,
}: TransactionRowProps) {
  const merchantName = item.merchant_name ?? "未指定商家";
  const amountColor = item.type === "income" ? incomeColor : expenseColor;
  const time = new Date(item.transaction_at).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const signedAmount = `${item.type === "expense" ? "-" : "+"}${formatNumber(item.amount)}`;

  const categoryLabel = getCategoryLabel(item.categoryItems);

  const accountTimeLine = [
    showAccount ? item.account_name : null,
    showRecorder ? (item.recorder_name ?? null) : null,
    showTime ? time : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", py: 1.4 }}>
      <Avatar
        alt={merchantName}
        src={item.merchant_icon_url ?? undefined}
        sx={{
          bgcolor: avatarBackground,
          color: primaryPurple,
          flexShrink: 0,
          fontSize: 18,
          fontWeight: 800,
          height: 42,
          width: 42,
        }}
      >
        {getMerchantInitial(item.merchant_name)}
      </Avatar>

      <Stack spacing={0.3} sx={{ flex: 1, minWidth: 0 }}>
        {showType ? (
          <Chip
            color={item.type === "expense" ? "default" : "success"}
            label={item.type === "expense" ? "支出" : "收入"}
            size="small"
            sx={{ alignSelf: "flex-start" }}
          />
        ) : null}

        <Typography
          noWrap
          sx={{ fontSize: 14, fontWeight: 800, lineHeight: 1.3 }}
        >
          {merchantName}
        </Typography>

        {categoryLabel || (showNote && item.note) ? (
          <Typography noWrap sx={{ fontSize: 11, lineHeight: 1.4 }}>
            {[categoryLabel, showNote ? item.note : null]
              .filter(Boolean)
              .join(" · ")}
          </Typography>
        ) : null}

        {accountTimeLine ? (
          <Typography
            noWrap
            sx={{ fontSize: 11, lineHeight: 1.4, opacity: 0.45 }}
          >
            {accountTimeLine}
          </Typography>
        ) : null}
      </Stack>

      <Stack spacing={0.2} sx={{ alignItems: "flex-end", flexShrink: 0 }}>
        <Typography
          sx={{
            color: amountColor,
            fontSize: 15,
            fontWeight: 900,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
          }}
        >
          {signedAmount}
        </Typography>

        {voidAction ? (
          <form
            action={voidAction}
            onSubmit={(event) => {
              if (!window.confirm("确定要撤销这条记录吗？")) {
                event.preventDefault();
              }
            }}
          >
            <input name="transactionRecordId" type="hidden" value={item.id} />
            <Button
              color="error"
              size="small"
              sx={{ minWidth: 0, px: 0.5, py: 0, typography: "caption" }}
              type="submit"
              variant="text"
            >
              撤销
            </Button>
          </form>
        ) : null}
      </Stack>
    </Stack>
  );
}
