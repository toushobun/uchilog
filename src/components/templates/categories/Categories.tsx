import Stack from "@mui/material/Stack";

import { ErrorState } from "molecules/ui/ErrorState";
import { CategoryForm } from "organisms/categories/CategoryForm";
import { CategoryList } from "organisms/categories/CategoryList";
import { PageHeader } from "templates/layout/PageHeader";
import { PageShell } from "templates/layout/PageShell";
import type {
  CategoryAction,
  CategoryParentOption,
  CategoryTreeItem,
} from "types/categories";

type CategoriesTemplateProps = {
  archiveCategoryAction: CategoryAction;
  categories: CategoryTreeItem[];
  createCategoryAction: CategoryAction;
  errorCategoryId: string | null;
  errorMessage: string | null;
  ledgerName: string;
  parentOptions: CategoryParentOption[];
  updateCategoryAction: CategoryAction;
};

export function CategoriesTemplate({
  archiveCategoryAction,
  categories,
  createCategoryAction,
  errorCategoryId,
  errorMessage,
  ledgerName,
  parentOptions,
  updateCategoryAction,
}: CategoriesTemplateProps) {
  return (
    <PageShell>
      <PageHeader
        title="分类"
        subtitle={
          <Stack spacing={0.5}>
            <span>当前账本：{ledgerName}</span>
            <span>
              管理支出和收入分类。记账时只会使用小分类，大分类用于分组。
            </span>
          </Stack>
        }
      />

      {errorMessage && !errorCategoryId ? (
        <ErrorState title="分类操作失败" description={errorMessage} />
      ) : null}

      <CategoryForm
        createCategoryAction={createCategoryAction}
        parentOptions={parentOptions}
      />
      <CategoryList
        archiveCategoryAction={archiveCategoryAction}
        categories={categories}
        errorCategoryId={errorCategoryId}
        errorMessage={errorMessage}
        updateCategoryAction={updateCategoryAction}
      />
    </PageShell>
  );
}
