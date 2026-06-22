import type {
  AccountOptionDbRow,
  AppUserSummaryDbRow,
  CategorySummaryDbRow,
  MerchantSummaryDbRow,
  TransactionItemDbRow,
  TransactionRecordDbRow,
} from "server/db-types";
import type { TransactionListItem } from "types/transactions";

export function buildTransactionListItem({
  accountById,
  categoryById,
  fallbackCurrency,
  merchantById,
  record,
  recorderById,
  recordItems,
}: {
  accountById: Map<string, AccountOptionDbRow>;
  categoryById: Map<string, CategorySummaryDbRow>;
  fallbackCurrency: string;
  merchantById: Map<string, MerchantSummaryDbRow>;
  record: TransactionRecordDbRow;
  recorderById?: Map<string, AppUserSummaryDbRow>;
  recordItems: TransactionItemDbRow[];
}): TransactionListItem {
  const firstItem = recordItems[0];
  const merchant = record.merchant_id
    ? merchantById.get(record.merchant_id)
    : undefined;
  const recorder =
    record.created_by && recorderById
      ? recorderById.get(record.created_by)
      : undefined;

  if (record.type === "transfer") {
    const fromItem =
      recordItems.find((item) => Number(item.balance_delta ?? 0) < 0) ??
      firstItem;
    const toItem = recordItems.find(
      (item) => Number(item.balance_delta ?? 0) > 0,
    );
    const fromAccount = fromItem
      ? accountById.get(fromItem.account_id)
      : undefined;
    const toAccount = toItem ? accountById.get(toItem.account_id) : undefined;

    return {
      account_currency:
        fromAccount?.currency ?? toAccount?.currency ?? fallbackCurrency,
      account_name:
        fromAccount && toAccount
          ? `${fromAccount.name} → ${toAccount.name}`
          : (fromAccount?.name ?? toAccount?.name ?? "未知账户"),
      amount: fromItem?.amount ?? "0",
      categoryItems: [],
      created_at: record.created_at,
      id: record.id,
      merchant_icon_url: null,
      merchant_name: null,
      note: record.note ?? firstItem?.note ?? null,
      recorder_name: recorder?.display_name ?? null,
      transaction_at: record.transaction_at,
      type: record.type,
    };
  }

  const account = firstItem ? accountById.get(firstItem.account_id) : undefined;
  const totalAmount = recordItems.reduce(
    (sum, item) => sum + Number(item.amount),
    0,
  );

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
        parentCategoryName: parent?.name ?? null,
      },
    ];
  });

  return {
    account_currency: account?.currency ?? fallbackCurrency,
    account_name: account?.name ?? "未知账户",
    amount: String(totalAmount),
    categoryItems,
    created_at: record.created_at,
    id: record.id,
    merchant_icon_url: merchant?.icon_url ?? null,
    merchant_name: merchant?.name ?? null,
    note: record.note ?? firstItem?.note ?? null,
    recorder_name: recorder?.display_name ?? null,
    transaction_at: record.transaction_at,
    type: record.type,
  };
}
