import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import type { CategoryAction, CategoryTreeItem } from "types/categories";
import { GlassCard } from "atoms/ui/GlassCard";
import { EmptyState } from "molecules/ui/EmptyState";

type CategoryListProps = {
  archiveCategoryAction: CategoryAction;
  categories: CategoryTreeItem[];
  errorCategoryId: string | null;
  errorMessage: string | null;
  updateCategoryAction: CategoryAction;
};

const categoryTypeLabels = {
  expense: "支出分类",
  income: "收入分类",
} as const;

function CategoryEditForm({
  action,
  category,
}: {
  action: CategoryAction;
  category: { id: string; name: string };
}) {
  return (
    <Stack
      component="form"
      action={action}
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      sx={{ alignItems: { xs: "stretch", sm: "center" }, flex: 1 }}
    >
      <input name="categoryId" type="hidden" value={category.id} />
      <TextField
        defaultValue={category.name}
        fullWidth
        label="分类名称"
        name="name"
        required
        size="small"
        slotProps={{ htmlInput: { maxLength: 100 } }}
      />
      <Button type="submit" variant="outlined" sx={{ whiteSpace: "nowrap" }}>
        保存
      </Button>
    </Stack>
  );
}

function ArchiveButton({
  action,
  categoryId,
}: {
  action: CategoryAction;
  categoryId: string;
}) {
  return (
    <Stack component="form" action={action}>
      <input name="categoryId" type="hidden" value={categoryId} />
      <Button color="error" type="submit" variant="text">
        归档
      </Button>
    </Stack>
  );
}

export function CategoryList({
  archiveCategoryAction,
  categories,
  errorCategoryId,
  errorMessage,
  updateCategoryAction,
}: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <EmptyState
        title="还没有分类"
        description="先新增一个大分类，再在它下面新增小分类。"
      />
    );
  }

  const categoryGroups = (["expense", "income"] as const).map((type) => ({
    categories: categories.filter((category) => category.type === type),
    type,
  }));

  return (
    <Stack spacing={3} sx={{ mt: 4 }}>
      {categoryGroups.map(({ categories: groupCategories, type }) => (
        <Box key={type}>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
            {categoryTypeLabels[type]}
          </Typography>

          {groupCategories.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              暂无{type === "expense" ? "支出" : "收入"}分类。
            </Typography>
          ) : (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {groupCategories.map((category) => {
                const categoryErrorMessage =
                  errorCategoryId === category.id ? errorMessage : null;

                return (
                  <GlassCard
                    key={category.id}
                    sx={{
                      borderColor: categoryErrorMessage
                        ? "error.main"
                        : "var(--user-theme-card-border)",
                      p: 3,
                    }}
                  >
                    {categoryErrorMessage ? (
                      <Typography color="error" role="alert" sx={{ mb: 2 }}>
                        {categoryErrorMessage}
                      </Typography>
                    ) : null}

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      sx={{
                        alignItems: { xs: "stretch", sm: "center" },
                        justifyContent: "space-between",
                      }}
                    >
                      <CategoryEditForm
                        action={updateCategoryAction}
                        category={category}
                      />
                      <ArchiveButton
                        action={archiveCategoryAction}
                        categoryId={category.id}
                      />
                    </Stack>

                    <Divider sx={{ my: 2.5 }} />

                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      小分类
                    </Typography>

                    {category.children.length === 0 ? (
                      <Typography
                        color="text.secondary"
                        sx={{ mt: 1 }}
                        variant="body2"
                      >
                        还没有小分类。记账时只能选择小分类。
                      </Typography>
                    ) : (
                      <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                        {category.children.map((child) => {
                          const childErrorMessage =
                            errorCategoryId === child.id ? errorMessage : null;

                          return (
                            <Box key={child.id}>
                              {childErrorMessage ? (
                                <Typography
                                  color="error"
                                  role="alert"
                                  sx={{ mb: 1 }}
                                >
                                  {childErrorMessage}
                                </Typography>
                              ) : null}
                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1.5}
                                sx={{
                                  alignItems: {
                                    xs: "stretch",
                                    sm: "center",
                                  },
                                }}
                              >
                                <CategoryEditForm
                                  action={updateCategoryAction}
                                  category={child}
                                />
                                <ArchiveButton
                                  action={archiveCategoryAction}
                                  categoryId={child.id}
                                />
                              </Stack>
                            </Box>
                          );
                        })}
                      </Stack>
                    )}
                  </GlassCard>
                );
              })}
            </Stack>
          )}
        </Box>
      ))}
    </Stack>
  );
}
