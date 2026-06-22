import { redirect } from "next/navigation";

import { editTransactionErrorHref, transactionEditHref } from "config/paths";
import { createTransaction } from "server/actions/transactions";
import { loadNewTransactionView } from "server/loaders/transactionForm";
import { NewTransactionTemplate } from "templates/transactions/TransactionFormPage";
import type { TransactionRecordType } from "types/transactions";
import { getNewTransactionErrorMessage } from "utils/pageErrors";

function parseInitialType(type?: string): TransactionRecordType {
  if (type === "expense" || type === "income" || type === "transfer") {
    return type;
  }

  return "expense";
}

export default async function TransactionsNewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; editId?: string; type?: string }>;
}) {
  const params = await searchParams;

  if (params.editId) {
    redirect(
      params.error
        ? editTransactionErrorHref(params.editId, params.error)
        : transactionEditHref(params.editId),
    );
  }

  const view = await loadNewTransactionView();

  return (
    <NewTransactionTemplate
      action={createTransaction}
      errorMessage={getNewTransactionErrorMessage(params.error)}
      initialType={parseInitialType(params.type)}
      {...view}
    />
  );
}
