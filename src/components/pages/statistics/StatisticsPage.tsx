import Typography from "@mui/material/Typography";

import { PageCard } from "ui-molecules/PageCard";

type StatisticsPageProps = {
  ledgerName: string;
};

export function StatisticsPage({ ledgerName }: StatisticsPageProps) {
  return (
    <PageCard>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        统计
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        当前账本：{ledgerName}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        收支统计将在后续 Issue 中实现。
      </Typography>
    </PageCard>
  );
}
