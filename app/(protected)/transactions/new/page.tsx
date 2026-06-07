import { loadNewTransactionView } from "server/loaders/newTransaction";
import { NewTransactionPage as NewTransactionPageView } from "transactions-page/NewTransactionPage";
import { getNewTransactionErrorMessage } from "utils/pageErrors";

type NewTransactionPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewTransactionPage({
  searchParams,
}: NewTransactionPageProps) {
  const params = await searchParams;
  const view = await loadNewTransactionView();

  return (
    <NewTransactionPageView
      errorMessage={getNewTransactionErrorMessage(params.error)}
      {...view}
    />
  );
}
