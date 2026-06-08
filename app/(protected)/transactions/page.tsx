import { voidTransaction } from "server/actions/transactions";
import {
  loadTransactionMonthPage,
  loadTransactionMonthView,
} from "server/loaders/transactions";
import { TransactionsTemplate } from "templates/transactions/Transactions";
import { getTransactionErrorMessage } from "utils/pageErrors";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; month?: string }>;
}) {
  const params = await searchParams;
  const monthView = await loadTransactionMonthView(params.month);

  return (
    <TransactionsTemplate
      errorMessage={getTransactionErrorMessage(params.error)}
      loadMoreAction={loadTransactionMonthPage.bind(null, monthView.month)}
      monthView={monthView}
      voidAction={voidTransaction}
    />
  );
}
