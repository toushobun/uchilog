import { createTransaction } from "server/actions/transactions";
import { loadNewTransactionView } from "server/loaders/newTransaction";
import { NewTransactionTemplate } from "templates/transactions/NewTransaction";
import { getNewTransactionErrorMessage } from "utils/pageErrors";

export default async function TransactionsNewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const view = await loadNewTransactionView();

  return (
    <NewTransactionTemplate
      action={createTransaction}
      errorMessage={getNewTransactionErrorMessage(params.error)}
      {...view}
    />
  );
}
