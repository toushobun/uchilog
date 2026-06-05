"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import type {
  TransactionAmountSummary,
  TransactionListItem,
  TransactionMonthView,
} from "transactions-route/types";

type TransactionMonthListProps = {
  monthView: TransactionMonthView;
  voidAction?: (formData: FormData) => void;
};

const incomeColor = "#d64b4b";
const expenseColor = "#3f7f46";
const primaryPurple = "#6d4bb3";
const palePurple = "#f4efff";
const borderPurple = "#e5dcf6";

function formatAmount(amount: string, currency: string) {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return currency ? `${amount} ${currency}` : amount;
  }

  const formattedAmount = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);

  return currency ? `${formattedAmount} ${currency}` : formattedAmount;
}

function formatSignedAmount(
  type: "expense" | "income",
  amount: string,
  currency: string,
) {
  return `${type === "expense" ? "-" : "+"}${formatAmount(amount, currency)}`;
}

function getMerchantInitial(name: string | null) {
  return name?.trim().charAt(0).toUpperCase() || "记";
}

function getAmountColor(type: "expense" | "income") {
  return type === "income" ? incomeColor : expenseColor;
}

function SummaryItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <Stack
      spacing={0.4}
      sx={{
        alignItems: "center",
        flex: 1,
        minWidth: 0,
      }}
    >
      <Typography color="text.secondary" variant="caption">
        {label}
      </Typography>
      <Typography
        sx={{
          color: color ?? "text.primary",
          fontSize: 16,
          fontWeight: 800,
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function MonthSummary({ summary }: { summary: TransactionAmountSummary }) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: `1px solid ${borderPurple}`,
        borderRadius: 3,
        boxShadow: "0 10px 24px rgba(77, 55, 120, 0.06)",
        mt: 1.5,
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        divider={<Divider flexItem orientation="vertical" />}
        sx={{ px: 2, py: 1.5 }}
      >
        <SummaryItem
          color={incomeColor}
          label="收入"
          value={formatAmount(summary.income, summary.currency)}
        />
        <SummaryItem
          color={expenseColor}
          label="支出"
          value={formatAmount(summary.expense, summary.currency)}
        />
        <SummaryItem
          label="结余"
          value={formatAmount(summary.balance, summary.currency)}
        />
      </Stack>
    </Box>
  );
}

function TransactionRow({
  item,
  voidAction,
}: {
  item: TransactionListItem;
  voidAction?: (formData: FormData) => void;
}) {
  const merchantName = item.merchant_name ?? "未指定商家";
  const amountColor = getAmountColor(item.type);

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: "center",
        bgcolor: "background.paper",
        px: 0,
        py: 1.4,
      }}
    >
      <Avatar
        alt={merchantName}
        src={item.merchant_icon_url ?? undefined}
        sx={{
          bgcolor: palePurple,
          color: primaryPurple,
          fontSize: 18,
          fontWeight: 800,
          height: 42,
          width: 42,
        }}
      >
        {getMerchantInitial(item.merchant_name)}
      </Avatar>

      <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          noWrap
          sx={{ fontSize: 15, fontWeight: 800, lineHeight: 1.25 }}
        >
          {merchantName}
        </Typography>
        <Typography color="text.secondary" noWrap variant="caption">
          {item.category_name ?? "未分类"} · {item.account_name} ·{" "}
          {new Date(item.transaction_at).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>
        {item.note ? (
          <Typography color="text.secondary" noWrap variant="caption">
            {item.note}
          </Typography>
        ) : null}
      </Stack>

      <Stack spacing={0.2} sx={{ alignItems: "flex-end", minWidth: 86 }}>
        <Typography
          sx={{
            color: amountColor,
            fontSize: 15,
            fontWeight: 900,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
          }}
        >
          {formatSignedAmount(item.type, item.amount, item.account_currency)}
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

export function TransactionMonthList({
  monthView,
  voidAction,
}: TransactionMonthListProps) {
  if (monthView.groups.length === 0) {
    return (
      <Stack spacing={2.5} sx={{ mt: 1.5 }}>
        <MonthSummary summary={monthView.summary} />
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 3,
            px: 2,
            py: 4,
            textAlign: "center",
          }}
        >
          <Typography color="text.secondary">这个月还没有记账记录。</Typography>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={2} sx={{ mt: 1.5 }}>
      <MonthSummary summary={monthView.summary} />

      <Stack
        sx={{
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: "0 10px 24px rgba(77, 55, 120, 0.05)",
          overflow: "hidden",
        }}
      >
        {monthView.groups.map((group, groupIndex) => (
          <Box key={group.date}>
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: "center",
                bgcolor: palePurple,
                justifyContent: "space-between",
                px: 1.6,
                py: 0.7,
              }}
            >
              <Typography
                color="text.secondary"
                sx={{ fontSize: 13, fontWeight: 800 }}
              >
                {group.label}
              </Typography>
              <Typography
                sx={{
                  color: Number(group.summary.balance) >= 0 ? incomeColor : expenseColor,
                  fontSize: 13,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                当日 {formatAmount(group.summary.balance, group.summary.currency)}
              </Typography>
            </Stack>

            <Stack divider={<Divider flexItem sx={{ ml: 7.2 }} />} sx={{ px: 1.6 }}>
              {group.items.map((item) => (
                <TransactionRow
                  item={item}
                  key={item.id}
                  voidAction={voidAction}
                />
              ))}
            </Stack>

            {groupIndex < monthView.groups.length - 1 ? <Divider /> : null}
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
