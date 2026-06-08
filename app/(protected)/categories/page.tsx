import {
  archiveCategory,
  createCategory,
  updateCategory,
} from "server/actions/categories";
import { loadCategoriesView } from "server/loaders/categories";
import { CategoriesTemplate } from "templates/categories/Categories";
import { getCategoryErrorMessage } from "utils/pageErrors";

export default async function CategoriesRoute({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; error?: string }>;
}) {
  const params = await searchParams;
  const view = await loadCategoriesView();

  return (
    <CategoriesTemplate
      {...view}
      archiveCategoryAction={archiveCategory}
      createCategoryAction={createCategory}
      errorCategoryId={params.categoryId ?? null}
      errorMessage={getCategoryErrorMessage(params.error)}
      updateCategoryAction={updateCategory}
    />
  );
}
