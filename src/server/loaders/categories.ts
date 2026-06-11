import { getCurrentLedgerOrRedirect } from "lib/ledger/current-ledger";
import { createClient } from "lib/supabase/server";
import type {
  CategoriesViewData,
  CategoryRow,
  CategoryTreeItem,
} from "types/categories";

export async function loadCategoriesView(): Promise<CategoriesViewData> {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("category")
    .select("id, name, parent_id, type, sort_order, created_at")
    .eq("ledger_id", currentLedger.id)
    .eq("is_archived", false)
    .order("type", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Failed to load categories");
  }

  const categories = (data ?? []) as CategoryRow[];
  const roots: CategoryTreeItem[] = categories
    .filter((category) => category.parent_id === null)
    .map((category) => ({
      ...category,
      children: [],
    }));
  const rootById = new Map(roots.map((category) => [category.id, category]));

  for (const category of categories) {
    if (category.parent_id === null) continue;

    rootById.get(category.parent_id)?.children.push(category);
  }

  return {
    categories: roots,
    ledgerName: currentLedger.name,
    parentOptions: roots.map((category) => ({
      id: category.id,
      name: category.name,
      type: category.type,
    })),
  };
}
