import Typography from "@mui/material/Typography";

import { TransactionForm } from "transactions/TransactionForm";
import { GlassCard } from "ui/GlassCard";
import { getCurrentLedgerOrRedirect } from "lib/ledger/current-ledger";
import { createClient } from "lib/supabase/server";

import { createTransaction } from "../actions";
import type {
  TransactionAccountOption,
  TransactionMerchantOption,
} from "types/transactions";

type NewTransactionPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

type CategoryRow = {
  id: string;
  name: string;
  type: "expense" | "income";
  parent_id: string | null;
};

const errorMessages: Record<string, string> = {
  account_invalid: "账户指定不正确。",
  amount_invalid: "金额必须为正数，且最多两位小数。",
  category_invalid: "分类指定不正确。",
  create_failed: "新增记账失败。请稍后重试。",
  date_invalid: "发生时间不正确。",
  merchant_invalid: "商家指定不正确。",
  type_invalid: "记账类型不正确。",
};

export default async function NewTransactionPage({
  searchParams,
}: NewTransactionPageProps) {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const params = await searchParams;
  const errorMessage = params.error
    ? (errorMessages[params.error] ?? null)
    : null;
  const supabase = await createClient();

  const [accountResult, categoryResult, merchantResult] = await Promise.all([
    supabase
      .from("account")
      .select("id, name, currency")
      .eq("ledger_id", currentLedger.id)
      .eq("is_archived", false)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),

    supabase
      .from("category")
      .select("id, name, type, parent_id")
      .eq("ledger_id", currentLedger.id)
      .eq("is_archived", false)
      .not("parent_id", "is", null)
      .order("type", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),

    supabase
      .from("merchant")
      .select("id, name, icon_url")
      .eq("ledger_id", currentLedger.id)
      .eq("is_archived", false)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (accountResult.error) {
    throw new Error("Failed to load transaction account options");
  }

  if (categoryResult.error) {
    throw new Error("Failed to load transaction category options");
  }

  if (merchantResult.error) {
    throw new Error("Failed to load transaction merchant options");
  }

  const accountOptions = (accountResult.data ??
    []) as TransactionAccountOption[];
  const categoryOptions = ((categoryResult.data ?? []) as CategoryRow[]).map(
    (category) => ({
      id: category.id,
      name: category.name,
      type: category.type,
    }),
  );
  const merchantOptions = (merchantResult.data ??
    []) as TransactionMerchantOption[];

  return (
    <GlassCard
      sx={{
        p: { xs: 4, sm: 5 },
      }}
    >
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        新增记录
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        当前账本：{currentLedger.name}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        录入一笔最基础的收入或支出。余额联动将在后续单独实现。
      </Typography>

      <TransactionForm
        action={createTransaction}
        accountOptions={accountOptions}
        categoryOptions={categoryOptions}
        errorMessage={errorMessage}
        merchantOptions={merchantOptions}
      />
    </GlassCard>
  );
}
