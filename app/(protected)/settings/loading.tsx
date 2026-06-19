import { LoadingState } from "molecules/ui/LoadingState";
import { PageHeader } from "templates/layout/PageHeader";
import { PageShell } from "templates/layout/PageShell";

export default function SettingsLoadingPage() {
  return (
    <PageShell>
      <PageHeader title="设置" />
      <LoadingState title="正在读取设置数据" />
    </PageShell>
  );
}
