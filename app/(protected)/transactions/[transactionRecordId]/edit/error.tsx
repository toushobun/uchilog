"use client";

import Button from "@mui/material/Button";
import { useEffect } from "react";

import { ErrorState } from "molecules/ui/ErrorState";
import { PageHeader } from "templates/layout/PageHeader";
import { PageShell } from "templates/layout/PageShell";

const editTransactionLoadErrorDescription =
  "这笔记账暂时无法读取。不存在或无权限的记录仍会显示 404，本提示表示读取过程中发生了未预期错误。";

type TransactionEditErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function TransactionEditErrorPage({
  error,
  reset,
}: TransactionEditErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const description = error.digest
    ? `${editTransactionLoadErrorDescription}错误编号：${error.digest}`
    : editTransactionLoadErrorDescription;

  return (
    <PageShell>
      <PageHeader title="编辑记账" subtitle="读取编辑数据时发生错误。" />
      <ErrorState
        title="编辑记账读取失败"
        description={description}
        action={
          <Button variant="outlined" onClick={reset}>
            重新读取编辑数据
          </Button>
        }
      />
    </PageShell>
  );
}
