import { redirect } from "next/navigation";

import { editTransactionErrorHref, transactionEditHref } from "config/paths";
import { createTransaction } from "server/actions/transactions";
import { loadNewTransactionView } from "server/loaders/transactionForm";
import { NewTransactionTemplate } from "templates/transactions/TransactionFormPage";
import { getNewTransactionErrorMessage } from "utils/pageErrors";

export default async function TransactionsNewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; editId?: string }>;
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
      {...view}
    />
  );
}
