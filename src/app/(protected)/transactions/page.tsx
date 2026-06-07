import { voidTransaction } from "server/actions/transactions";
import {
  loadTransactionMonthPage,
  loadTransactionMonthView,
} from "server/loaders/transactions";
import { TransactionsHome } from "transactions-page/TransactionsHome";

type TransactionsPageProps = {
  searchParams: Promise<{
    error?: string;
    month?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  void_failed: "记录删除失败。请稍后重试。",
  void_invalid: "删除对象不正确。",
};

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;
  const errorMessage = params.error
    ? (errorMessages[params.error] ?? null)
    : null;
  const monthView = await loadTransactionMonthView(params.month);

  return (
    <TransactionsHome
      errorMessage={errorMessage}
      loadMoreAction={loadTransactionMonthPage.bind(null, monthView.month)}
      monthView={monthView}
      voidAction={voidTransaction}
    />
  );
}
