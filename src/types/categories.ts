import type { TransactionType } from "types/transactions";
import type { ServerAction } from "types/actions";

export const categoryTypeOptions = [
  { label: "支出", value: "expense" },
  { label: "收入", value: "income" },
] as const satisfies ReadonlyArray<{
  label: string;
  value: TransactionType;
}>;

export type CategoryAction = ServerAction;

export type CategoryRow = {
  id: string;
  name: string;
  parent_id: string | null;
  type: TransactionType;
  sort_order: number;
  created_at: string;
};

export type CategoryTreeItem = CategoryRow & {
  children: CategoryRow[];
};

export type CategoryParentOption = {
  id: string;
  name: string;
  type: TransactionType;
};

export type CategoriesViewData = {
  categories: CategoryTreeItem[];
  ledgerName: string;
  parentOptions: CategoryParentOption[];
};
