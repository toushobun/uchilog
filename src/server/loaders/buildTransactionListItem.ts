import type {
  AccountOptionDbRow,
  AppUserSummaryDbRow,
  CategorySummaryDbRow,
  MerchantSummaryDbRow,
  TransactionItemDbRow,
  TransactionRecordDbRow,
} from "server/db-types";
import type {
  TransactionCategoryType,
  TransactionListItem,
} from "types/transactions";

export function buildTransactionListItem({
  accountById,
  categoryById,
  fallbackCurrency,
  merchantById,
  record,
  recorderById,
  recordItems,
  tagNamesByRecordId,
}: {
  accountById: Map<string, AccountOptionDbRow>;
  categoryById: Map<string, CategorySummaryDbRow>;
  fallbackCurrency: string;
  merchantById: Map<string, MerchantSummaryDbRow>;
  record: TransactionRecordDbRow;
  recorderById?: Map<string, AppUserSummaryDbRow>;
  recordItems: TransactionItemDbRow[];
  tagNamesByRecordId?: Map<string, string[]>;
}): TransactionListItem {
  const recorder =
    record.created_by && recorderById
      ? recorderById.get(record.created_by)
      : undefined;

  if (record.type === "transfer") {
    return buildTransferListItem({
      accountById,
      fallbackCurrency,
      record,
      recorderById: recorder,
      recordItems,
    });
  }

  const firstItem = recordItems[0];
  const account = firstItem ? accountById.get(firstItem.account_id) : undefined;
  const merchant = record.merchant_id
    ? merchantById.get(record.merchant_id)
    : undefined;
  const normalAmountSummary = getNormalAmountSummary(recordItems, categoryById);
  const displayType = getDisplayTransactionType(normalAmountSummary);

  const categoryItems = recordItems.flatMap((item) => {
    if (item.category_id === null) return [];

    const category = categoryById.get(item.category_id);
    const parent = category?.parent_id
      ? categoryById.get(category.parent_id)
      : undefined;

    return [
      {
        amount: item.amount,
        categoryName: category?.name ?? "",
        categoryType: category?.type,
        parentCategoryName: parent?.name ?? null,
      },
    ];
  });

  return {
    account_currency: account?.currency ?? fallbackCurrency,
    account_name: account?.name ?? "未知账户",
    amount: String(Math.abs(normalAmountSummary.netAmount)),
    categoryItems,
    created_at: record.created_at,
    id: record.id,
    merchant_icon_url: merchant?.icon_url ?? null,
    merchant_name: merchant?.name ?? null,
    note: record.note ?? firstItem?.note ?? null,
    recorder_name: recorder?.display_name ?? null,
    tagNames: tagNamesByRecordId?.get(record.id) ?? [],
    transaction_at: record.transaction_at,
    type: displayType,
  };
}

function buildTransferListItem({
  accountById,
  fallbackCurrency,
  record,
  recorderById: recorder,
  recordItems,
}: {
  accountById: Map<string, AccountOptionDbRow>;
  fallbackCurrency: string;
  record: TransactionRecordDbRow;
  recorderById: AppUserSummaryDbRow | undefined;
  recordItems: TransactionItemDbRow[];
}): TransactionListItem {
  const fromItem = recordItems.find(
    (item) => Number(item.balance_delta ?? "0") < 0,
  );
  const toItem = recordItems.find(
    (item) => Number(item.balance_delta ?? "0") > 0,
  );
  const fallbackItem = recordItems[0];

  const fromAccount = fromItem
    ? accountById.get(fromItem.account_id)
    : undefined;
  const toAccount = toItem ? accountById.get(toItem.account_id) : undefined;
  const fallbackAccount = fallbackItem
    ? accountById.get(fallbackItem.account_id)
    : undefined;

  const fromName = fromAccount?.name ?? "未知账户";
  const toName = toAccount?.name ?? "未知账户";
  const accountName =
    fromAccount || toAccount ? `${fromName} → ${toName}` : "未知账户";

  const currency =
    fromAccount?.currency ??
    toAccount?.currency ??
    fallbackAccount?.currency ??
    fallbackCurrency;

  const amount = fromItem?.amount ?? fallbackItem?.amount ?? "0";

  return {
    account_currency: currency,
    account_name: accountName,
    amount,
    categoryItems: [],
    created_at: record.created_at,
    id: record.id,
    merchant_icon_url: null,
    merchant_name: null,
    note: record.note ?? null,
    recorder_name: recorder?.display_name ?? null,
    tagNames: [],
    transaction_at: record.transaction_at,
    type: "transfer",
  };
}

function getNormalAmountSummary(
  items: TransactionItemDbRow[],
  categoryById: Map<string, CategorySummaryDbRow>,
) {
  let expenseTotal = 0;
  let incomeTotal = 0;

  for (const item of items) {
    const amount = Number(item.amount);

    if (!Number.isFinite(amount)) continue;

    const categoryType = item.category_id
      ? categoryById.get(item.category_id)?.type
      : undefined;

    if (categoryType === "income") {
      incomeTotal += amount;
    } else if (categoryType === "expense") {
      expenseTotal += amount;
    }
  }

  return {
    expenseTotal,
    incomeTotal,
    netAmount: incomeTotal - expenseTotal,
  };
}

function getDisplayTransactionType({
  expenseTotal,
  incomeTotal,
  netAmount,
}: {
  expenseTotal: number;
  incomeTotal: number;
  netAmount: number;
}): TransactionCategoryType {
  if (netAmount > 0) return "income";
  if (netAmount < 0) return "expense";
  return incomeTotal >= expenseTotal ? "income" : "expense";
}
