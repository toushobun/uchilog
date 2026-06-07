import Typography from "@mui/material/Typography";

import { PageCard } from "ui-molecules/PageCard";

type CategoriesPageProps = {
  ledgerName: string;
};

export function CategoriesPage({ ledgerName }: CategoriesPageProps) {
  return (
    <PageCard>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        分类
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        当前账本：{ledgerName}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        分类列表和新增功能将在后续 Issue 中实现。
      </Typography>
    </PageCard>
  );
}
