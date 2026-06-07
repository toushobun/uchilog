import type {
  AccountRow,
  AppUserRow,
  CategoryRow,
  MerchantRow,
  TransactionItemRow,
  TransactionRecordRow,
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
  accountById: Map<string, AccountRow>;
  categoryById: Map<string, CategoryRow>;
  fallbackCurrency: string;
  merchantById: Map<string, MerchantRow>;
  record: TransactionRecordRow;
  recorderById?: Map<string, AppUserRow>;
  recordItems: TransactionItemRow[];
}): TransactionListItem {
  const firstItem = recordItems[0];
  const account = firstItem ? accountById.get(firstItem.account_id) : undefined;
  const merchant = record.merchant_id
    ? merchantById.get(record.merchant_id)
    : undefined;
  const recorder =
    record.created_by && recorderById
      ? recorderById.get(record.created_by)
      : undefined;
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
