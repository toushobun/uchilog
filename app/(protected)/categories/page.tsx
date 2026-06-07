import { CategoriesPage as CategoriesPageView } from "categories-page/CategoriesPage";
import { loadCategoriesView } from "server/loaders/categories";

export default async function CategoriesPage() {
  const view = await loadCategoriesView();

  return <CategoriesPageView {...view} />;
}
