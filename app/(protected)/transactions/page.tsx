import { unstable_rethrow } from "next/navigation";

import {
  loadTransactionTimeGroupItems,
  loadTransactionTimeGroupPage,
  loadTransactionTimeGroupView,
} from "server/loaders/transactionTimeGroups";
import { TransactionsTemplate } from "templates/transactions/Transactions";
import type { TransactionTimeGroupViewData } from "types/transactions";
import { getTransactionErrorMessage } from "utils/pageErrors";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const queryErrorMessage = getTransactionErrorMessage(params.error);
  let timeGroupView: TransactionTimeGroupViewData = emptyTimeGroupView;
  let loadErrorMessage: string | null = null;

  try {
    timeGroupView = await loadTransactionTimeGroupView();
  } catch (error) {
    unstable_rethrow(error);
    loadErrorMessage = "明细读取失败，请稍后重新读取。";
  }

  return (
    <TransactionsTemplate
      errorMessage={loadErrorMessage ?? queryErrorMessage}
      loadGroupItemsAction={loadTransactionTimeGroupItems}
      loadMoreGroupsAction={loadTransactionTimeGroupPage}
      timeGroupView={timeGroupView}
    />
  );
}

const emptyTimeGroupView: TransactionTimeGroupViewData = {
  groupBy: "month",
  groups: [],
  initialDateGroupsByGroupId: {},
  initialExpandedGroupId: null,
  initialNextItemOffsetByGroupId: {},
  nextOffset: null,
};
