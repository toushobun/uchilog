import { LoadingState } from "molecules/ui/LoadingState";
import { PageHeader } from "templates/layout/PageHeader";
import { PageShell } from "templates/layout/PageShell";

export default function StatisticsLoadingPage() {
  return (
    <PageShell>
      <PageHeader title="统计" />
      <LoadingState title="正在读取统计数据" />
    </PageShell>
  );
}
