import { unstable_rethrow } from "next/navigation";

import {
  loadStep4TransactionGroupItems,
  loadStep4TransactionGroupPage,
  loadStep4TransactionGroupView,
  loadTransactionFilterOptions,
} from "server/loaders/transactionStep4Groups";
import { TransactionsTemplate } from "templates/transactions/Transactions";
import type {
  TransactionFilterOptions,
  TransactionTimeGroupViewData,
} from "types/transactions";
import { getTransactionErrorMessage } from "utils/pageErrors";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const queryErrorMessage = getTransactionErrorMessage(params.error);
  let timeGroupView: TransactionTimeGroupViewData = emptyTimeGroupView;
  let filterOptions: TransactionFilterOptions = emptyFilterOptions;
  let loadErrorMessage: string | null = null;

  try {
    [timeGroupView, filterOptions] = await Promise.all([
      loadStep4TransactionGroupView("month"),
      loadTransactionFilterOptions(),
    ]);
  } catch (error) {
    unstable_rethrow(error);
    loadErrorMessage = "明细读取失败，请稍后重新读取。";
  }

  return (
    <TransactionsTemplate
      errorMessage={loadErrorMessage ?? queryErrorMessage}
      filterOptions={filterOptions}
      loadFilteredGroupItemsAction={loadStep4TransactionGroupItems}
      loadFilteredGroupsAction={loadStep4TransactionGroupPage}
      loadGroupViewAction={loadStep4TransactionGroupView}
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

const emptyFilterOptions: TransactionFilterOptions = {
  accounts: [],
  categories: [],
  members: [],
  merchants: [],
  tags: [],
};
