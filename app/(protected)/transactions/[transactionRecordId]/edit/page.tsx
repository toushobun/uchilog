import { saveEditTransaction } from "server/actions/transactions";
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
  const initialValues = view.initialValues;

  if (initialValues.type === "transfer") {
    return (
      <EditTransferTransactionTemplate
        accountOptions={view.accountOptions}
        action={saveEditTransaction}
        categoryOptions={view.categoryOptions}
        errorMessage={errorMessage}
        initialValues={initialValues}
        ledgerName={view.ledgerName}
        merchantOptions={view.merchantOptions}
        tagOptions={view.tagOptions}
      />
    );
  }

  return (
    <EditTransactionTemplate
      accountOptions={view.accountOptions}
      action={saveEditTransaction}
      categoryOptions={view.categoryOptions}
      errorMessage={errorMessage}
      initialValues={initialValues}
      ledgerName={view.ledgerName}
      merchantOptions={view.merchantOptions}
      tagOptions={view.tagOptions}
    />
  );
}
