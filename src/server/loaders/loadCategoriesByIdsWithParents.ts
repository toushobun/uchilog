import { createClient } from "lib/supabase/server";

import type { CategoryRow } from "server/db-types";

export async function loadCategoriesByIdsWithParents(
  categoryIds: string[],
  ledgerId: string,
) {
  const supabase = await createClient();
  const uniqueCategoryIds = [...new Set(categoryIds)];

  if (uniqueCategoryIds.length === 0) {
    return [] as CategoryRow[];
  }

  const { data: categoryData, error: categoryError } = await supabase
    .from("category")
    .select("id, name, parent_id")
    .eq("ledger_id", ledgerId)
    .in("id", uniqueCategoryIds);

  if (categoryError) {
    throw new Error("Failed to load transaction categories");
  }

  const categories = (categoryData ?? []) as CategoryRow[];
  const parentCategoryIds = [
    ...new Set(
      categories
        .map((category) => category.parent_id)
        .filter((categoryId): categoryId is string => categoryId !== null),
    ),
  ].filter((categoryId) => !uniqueCategoryIds.includes(categoryId));

  if (parentCategoryIds.length === 0) {
    return categories;
  }

  const { data: parentCategoryData, error: parentCategoryError } =
    await supabase
      .from("category")
      .select("id, name, parent_id")
      .eq("ledger_id", ledgerId)
      .in("id", parentCategoryIds);

  if (parentCategoryError) {
    throw new Error("Failed to load transaction parent categories");
  }

  return [...categories, ...((parentCategoryData ?? []) as CategoryRow[])];
}
