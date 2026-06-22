"use client";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { TransactionDateTime } from "atoms/transactions/TransactionDateTime";
import type { ServerAction } from "types/actions";
import type { TransactionListItem } from "types/transactions";
import { getMerchantInitial } from "utils/merchants";
import {
  formatTransactionRowAmount,
  getCategoryLabel,
} from "utils/transactions";

type TransactionListRowProps = {
  item: TransactionListItem;
  voidAction?: ServerAction;
};

function getTransactionTypeChip(item: TransactionListItem) {
  if (item.type === "expense") {
    return <Chip color="default" label="支出" size="small" />;
  }

  if (item.type === "income") {
    return <Chip color="success" label="收入" size="small" />;
  }

  return <Chip color="primary" label="转账" size="small" />;
}

export function TransactionListRow({
  item,
  voidAction,
}: TransactionListRowProps) {
  const categoryLabel = getCategoryLabel(item.categoryItems);

  return (
    <Stack spacing={1.2} sx={{ py: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
        }}
      >
        <Stack spacing={0.8}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            {getTransactionTypeChip(item)}
            {item.type !== "transfer" && categoryLabel ? (
              <Chip label={categoryLabel} size="small" />
            ) : null}
            {item.merchant_name ? (
              <Chip
                avatar={
                  <Avatar
                    alt={item.merchant_name}
                    src={item.merchant_icon_url ?? undefined}
                  >
                    {getMerchantInitial(item.merchant_name, "商")}
                  </Avatar>
                }
                label={item.merchant_name}
                size="small"
              />
            ) : null}
          </Stack>

          <Typography color="text.secondary" variant="body2">
            <TransactionDateTime value={item.transaction_at} />
          </Typography>

          <Typography color="text.secondary" variant="body2">
            账户：{item.account_name}
          </Typography>
        </Stack>

        <Stack
          spacing={1}
          sx={{ alignItems: { xs: "flex-start", sm: "flex-end" } }}
        >
          <Typography component="p" sx={{ fontWeight: 700 }} variant="h6">
            {formatTransactionRowAmount(
              item.type,
              item.amount,
              item.account_currency,
            )}
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
              <Button color="error" size="small" type="submit" variant="text">
                撤销
              </Button>
            </form>
          ) : null}
        </Stack>
      </Stack>

      {item.note ? (
        <Typography color="text.secondary" variant="body2">
          {item.note}
        </Typography>
      ) : null}
    </Stack>
  );
}
