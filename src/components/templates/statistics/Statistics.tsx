import Typography from "@mui/material/Typography";

import { PagePanel } from "ui-organisms/PagePanel";

type StatisticsTemplateProps = {
  ledgerName: string;
};

export function StatisticsTemplate({ ledgerName }: StatisticsTemplateProps) {
  return (
    <PagePanel>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        统计
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        当前账本：{ledgerName}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        收支统计将在后续 Issue 中实现。
      </Typography>
    </PagePanel>
  );
}
