import { voidTransaction } from "server/actions/transactions";
import {
  loadTransactionMonthPage,
  loadTransactionMonthView,
} from "server/loaders/transactions";
import { TransactionsHome } from "transactions-page/TransactionsHome";
import { getTransactionErrorMessage } from "utils/pageErrors";

type TransactionsPageProps = {
  searchParams: Promise<{
    error?: string;
    month?: string;
  }>;
};

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;
  const monthView = await loadTransactionMonthView(params.month);

  return (
    <TransactionsHome
      errorMessage={getTransactionErrorMessage(params.error)}
      loadMoreAction={loadTransactionMonthPage.bind(null, monthView.month)}
      monthView={monthView}
      voidAction={voidTransaction}
    />
  );
}
