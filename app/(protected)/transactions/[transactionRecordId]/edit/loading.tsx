import { LoadingState } from "molecules/ui/LoadingState";
import { PageHeader } from "templates/layout/PageHeader";
import { PageShell } from "templates/layout/PageShell";

export default function TransactionEditLoadingPage() {
  return (
    <PageShell>
      <PageHeader title="编辑记账" subtitle="正在读取这笔记账的编辑数据。" />
      <LoadingState
        title="正在读取记账数据"
        description="请稍等，读取完成后会自动显示编辑表单。"
      />
    </PageShell>
  );
}
