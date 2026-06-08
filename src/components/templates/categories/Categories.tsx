import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { CategoryForm } from "categories/CategoryForm";
import { CategoryList } from "categories/CategoryList";
import type {
  CategoryAction,
  CategoryParentOption,
  CategoryTreeItem,
} from "types/categories";
import { PageCard } from "ui-molecules/PageCard";

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
    <Stack spacing={3}>
      <PageCard>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
          分类
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          当前账本：{ledgerName}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          管理支出和收入分类。记账时只会使用小分类，大分类用于分组。
        </Typography>

        {errorMessage && !errorCategoryId ? (
          <Typography color="error" role="alert" sx={{ mt: 3 }}>
            {errorMessage}
          </Typography>
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
      </PageCard>
    </Stack>
  );
}
