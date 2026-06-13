import { updateTransaction } from "server/actions/transactions";
import { loadEditTransactionView } from "server/loaders/transactionForm";
import { EditTransactionTemplate } from "templates/transactions/TransactionFormPage";
import { getEditTransactionErrorMessage } from "utils/pageErrors";

export default async function TransactionEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ transactionRecordId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ transactionRecordId }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const view = await loadEditTransactionView(transactionRecordId);

  return (
    <EditTransactionTemplate
      action={updateTransaction}
      errorMessage={getEditTransactionErrorMessage(query.error)}
      {...view}
    />
  );
}
