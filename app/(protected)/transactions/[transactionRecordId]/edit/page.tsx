import {
  updateTransaction,
  updateTransferTransaction,
} from "server/actions/transactions";
import { loadEditTransactionView } from "server/loaders/transactionForm";
import {
  EditTransactionTemplate,
  EditTransferTransactionTemplate,
} from "templates/transactions/TransactionFormPage";
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
  const errorMessage = getEditTransactionErrorMessage(query.error);

  if (view.initialValues.type === "transfer") {
    return (
      <EditTransferTransactionTemplate
        action={updateTransferTransaction}
        errorMessage={errorMessage}
        initialValues={view.initialValues}
        accountOptions={view.accountOptions}
        ledgerName={view.ledgerName}
      />
    );
  }

  if (!("categoryOptions" in view)) {
    throw new Error("Unexpected view type");
  }

  return (
    <EditTransactionTemplate
      action={updateTransaction}
      errorMessage={errorMessage}
      {...view}
    />
  );
}
