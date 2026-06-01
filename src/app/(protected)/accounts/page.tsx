import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { getCurrentLedgerOrRedirect } from "@/lib/ledger/current-ledger";
import { createClient } from "@/lib/supabase/server";

import { AccountForm } from "./account-form";
import { AccountList } from "./account-list";
import type { AccountRow } from "./types";

type AccountsPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  account_invalid: "账户指定不正确。",
  archive_failed: "账户归档失败。",
  create_failed: "账户新增失败。请确认账户名称是否重复，或稍后重试。",
  update_failed: "账户更新失败。请确认账户名称是否重复，或稍后重试。",
  currency_invalid: "货币必须是 3 位大写字母，例如 JPY。",
  initial_balance_invalid: "初始余额必须是数字。",
  name_required: "请输入账户名称。",
  type_invalid: "账户类型不正确。",
};

export default async function AccountsPage({
  searchParams,
}: AccountsPageProps) {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const params = await searchParams;
  const errorMessage = params.error
    ? (errorMessages[params.error] ?? null)
    : null;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("account")
    .select(
      "id, name, type, currency, initial_balance, current_balance, sort_order, created_at",
    )
    .eq("ledger_id", currentLedger.id)
    .eq("is_archived", false)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Failed to load accounts");
  }

  const accounts = (data ?? []) as AccountRow[];

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 4, sm: 5 },
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        账户
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        当前账本：{currentLedger.name}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        管理现金、银行账户、信用卡、电子钱包等账户。
      </Typography>

      {errorMessage ? (
        <Typography color="error" role="alert" sx={{ mt: 3 }}>
          {errorMessage}
        </Typography>
      ) : null}

      <AccountForm defaultCurrency={currentLedger.baseCurrency} />
      <AccountList accounts={accounts} />
    </Paper>
  );
}
