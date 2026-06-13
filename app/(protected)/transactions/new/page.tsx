import {
  createTransaction,
  updateTransaction,
} from "server/actions/transactions";
import {
  loadEditTransactionView,
  loadNewTransactionView,
} from "server/loaders/newTransaction";
import {
  EditTransactionTemplate,
  NewTransactionTemplate,
} from "templates/transactions/NewTransaction";
import {
  getEditTransactionErrorMessage,
  getNewTransactionErrorMessage,
} from "utils/pageErrors";

export default async function TransactionsNewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; editId?: string }>;
}) {
  const params = await searchParams;

  if (params.editId) {
    const view = await loadEditTransactionView(params.editId);

    return (
      <EditTransactionTemplate
        action={updateTransaction}
        errorMessage={getEditTransactionErrorMessage(params.error)}
        {...view}
      />
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
