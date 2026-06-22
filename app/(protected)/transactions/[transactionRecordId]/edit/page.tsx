import { notFound } from "next/navigation";

import {
  updateTransaction,
  updateTransferTransaction,
} from "server/actions/transactions";
import {
  loadEditTransactionView,
  loadEditTransferTransactionView,
} from "server/loaders/transactionForm";
import { loadTransactionRecordType } from "server/loaders/transactionRecordType";
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

  if (transactionRecordId.length !== 36) {
    notFound();
  }

  const errorMessage = getEditTransactionErrorMessage(query.error);
  const recordType = await loadTransactionRecordType(transactionRecordId);

  if (recordType === "transfer") {
    const transferView = await loadEditTransferTransactionView(
      transactionRecordId,
    );

    return (
      <EditTransferTransactionTemplate
        action={updateTransferTransaction}
        errorMessage={errorMessage}
        {...transferView}
      />
    );
  }

  const view = await loadEditTransactionView(transactionRecordId);

  return (
    <EditTransactionTemplate
      action={updateTransaction}
      errorMessage={errorMessage}
      {...view}
    />
  );
}
