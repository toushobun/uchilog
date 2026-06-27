import { saveEditTransaction } from "server/actions/transactions";
import { loadEditTransactionView } from "server/loaders/transactionForm";
import {
  EditTransactionTemplate,
  EditTransferTransactionTemplate,
} from "templates/transactions/TransactionFormPage";
import { NewTransactionVisualFrame } from "templates/transactions/NewTransactionVisualFrame";
import { getEditTransactionErrorMessage } from "utils/pageErrors";

const editVisualFrameProps = { fullBleed: false } as const;

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
      <NewTransactionVisualFrame {...editVisualFrameProps}>
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
      </NewTransactionVisualFrame>
    );
  }

  return (
    <NewTransactionVisualFrame {...editVisualFrameProps}>
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
    </NewTransactionVisualFrame>
  );
}
