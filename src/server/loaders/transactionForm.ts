import { notFound } from "next/navigation";

import { getCurrentLedgerOrRedirect } from "lib/ledger/current-ledger";
import { createClient } from "lib/supabase/server";
import type {
  CategoryOptionDbRow,
  TransactionItemDbRow,
  TransactionRecordDbRow,
  TransactionRecordTagDbRow,
  TransactionTagDbRow,
} from "server/db-types";
import type {
  TransactionAccountOption,
  TransactionMerchantOption,
} from "types/transactions";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function loadNewTransactionView() {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const supabase = await createClient();
  const options = await loadTransactionFormOptions(supabase, currentLedger.id);

  return {
    ...options,
    ledgerName: currentLedger.name,
  };
}

export async function loadEditTransactionView(transactionRecordId: string) {
  if (!uuidPattern.test(transactionRecordId)) {
    notFound();
  }

  const currentLedger = await getCurrentLedgerOrRedirect();
  const supabase = await createClient();
  const [options, recordResult, itemResult, tagAssignmentResult] =
    await Promise.all([
      loadTransactionFormOptions(supabase, currentLedger.id),
      supabase
        .from("transaction_record")
        .select("id, type, transaction_at, merchant_id, note, created_at")
        .eq("ledger_id", currentLedger.id)
        .eq("id", transactionRecordId)
        .eq("status", "active")
        .in("type", ["expense", "income"])
        .limit(1),
      supabase
        .from("transaction_item")
        .select("transaction_record_id, account_id, category_id, amount, note")
        .eq("ledger_id", currentLedger.id)
        .eq("transaction_record_id", transactionRecordId)
        .in("stat_type", ["expense", "income"])
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true }),
      supabase
        .from("transaction_record_tag")
        .select("tag_id")
        .eq("ledger_id", currentLedger.id)
        .eq("transaction_record_id", transactionRecordId)
        .order("sort_order", { ascending: true }),
    ]);

  if (recordResult.error) {
    throw new Error("Failed to load transaction record for edit");
  }

  if (itemResult.error) {
    throw new Error("Failed to load transaction items for edit");
  }

  if (tagAssignmentResult.error) {
    throw new Error("Failed to load transaction tags for edit");
  }

  const record = ((recordResult.data ?? []) as TransactionRecordDbRow[])[0];
  const items = (itemResult.data ?? []) as TransactionItemDbRow[];
  const tagAssignments = (tagAssignmentResult.data ??
    []) as TransactionRecordTagDbRow[];

  if (!record || items.length === 0) {
    notFound();
  }

  const selectedTagIds = [...new Set(tagAssignments.map((tag) => tag.tag_id))];
  const selectedTagRows = await loadAssignedTransactionTags(
    supabase,
    currentLedger.id,
    selectedTagIds,
  );
  const selectedTagById = new Map(selectedTagRows.map((tag) => [tag.id, tag]));
  const selectedTagNames = tagAssignments
    .map((assignment) => selectedTagById.get(assignment.tag_id)?.name)
    .filter((name): name is string => Boolean(name));

  // 当前编辑范围内，一笔支出 / 收入记录的所有明细共享同一个账户。
  const accountId = items[0]?.account_id ?? "";

  return {
    ...options,
    initialValues: {
      accountId,
      items: items.map((item) => ({
        amount: formatEditableAmount(item.amount),
        categoryId: item.category_id ?? "",
      })),
      merchantId: record.merchant_id,
      note: record.note ?? "",
      tagNames: selectedTagNames,
      transactionAt: record.transaction_at,
      transactionRecordId: record.id,
      type: record.type,
    },
    ledgerName: currentLedger.name,
  };
}

async function loadTransactionFormOptions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ledgerId: string,
) {
  const [accountResult, categoryResult, merchantResult, tagResult] =
    await Promise.all([
      supabase
        .from("account")
        .select("id, name, currency")
        .eq("ledger_id", ledgerId)
        .eq("is_archived", false)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),

      supabase
        .from("category")
        .select("id, name, type, parent_id")
        .eq("ledger_id", ledgerId)
        .eq("is_archived", false)
        .order("type", { ascending: true })
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),

      supabase
        .from("merchant")
        .select("id, name, icon_url")
        .eq("ledger_id", ledgerId)
        .eq("is_archived", false)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),

      supabase
        .from("transaction_tag")
        .select("id, name, color")
        .eq("ledger_id", ledgerId)
        .eq("is_archived", false)
        .order("name", { ascending: true })
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

  if (tagResult.error) {
    throw new Error("Failed to load transaction tag options");
  }

  const accountOptions = (accountResult.data ??
    []) as TransactionAccountOption[];
  const categoryRows = (categoryResult.data ?? []) as CategoryOptionDbRow[];
  const categoryOptions = buildCategoryOptions(categoryRows);
  const merchantOptions = (merchantResult.data ??
    []) as TransactionMerchantOption[];
  const tagOptions = (tagResult.data ?? []) as TransactionTagDbRow[];

  return {
    accountOptions,
    categoryOptions,
    merchantOptions,
    tagOptions,
  };
}

async function loadAssignedTransactionTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ledgerId: string,
  tagIds: string[],
) {
  if (tagIds.length === 0) {
    return [];
  }

  // 编辑回填时保留历史已关联标签，即使标签之后被归档也继续显示名称。
  const tagResult = await supabase
    .from("transaction_tag")
    .select("id, name, color")
    .eq("ledger_id", ledgerId)
    .in("id", tagIds);

  if (tagResult.error) {
    throw new Error("Failed to load assigned transaction tags for edit");
  }

  return (tagResult.data ?? []) as TransactionTagDbRow[];
}

export function buildCategoryOptions(rows: CategoryOptionDbRow[]) {
  const parentNameById = new Map(
    rows
      .filter((row) => row.parent_id === null)
      .map((row) => [row.id, row.name]),
  );
  return rows
    .filter((row) => row.parent_id !== null)
    .map((row) => ({
      id: row.id,
      name: row.name,
      parentId: row.parent_id,
      parentName: parentNameById.get(row.parent_id!) ?? null,
      type: row.type,
    }));
}

function formatEditableAmount(amount: string) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return amount;

  return value
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1");
}
