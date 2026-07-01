"use server";

import {
  loadTransactionGroupPage,
  loadTransactionMonthPage,
} from "server/loaders/transactions";
import type {
  TransactionGroupPage,
  TransactionMonthPage,
  TransactionTimeGroupViewData,
} from "types/transactions";

export async function loadTransactionTimeGroupView(): Promise<TransactionTimeGroupViewData> {
  const groupPage = await loadTransactionGroupPage("month", 0);
  const initialGroup = groupPage.groups[0] ?? null;
  const initialPage = initialGroup
    ? await loadTransactionMonthPage(initialGroup.key, 0)
    : null;

  return {
    groupBy: "month",
    groups: groupPage.groups,
    initialDateGroupsByGroupId:
      initialGroup && initialPage
        ? { [initialGroup.id]: initialPage.groups }
        : {},
    initialExpandedGroupId: initialGroup?.id ?? null,
    initialNextItemOffsetByGroupId:
      initialGroup && initialPage
        ? { [initialGroup.id]: initialPage.nextOffset }
        : {},
    nextOffset: groupPage.nextOffset,
  };
}

export async function loadTransactionTimeGroupPage(
  offset: number,
): Promise<TransactionGroupPage> {
  return loadTransactionGroupPage("month", offset);
}

export async function loadTransactionTimeGroupItems(
  month: string,
  offset: number,
): Promise<TransactionMonthPage> {
  return loadTransactionMonthPage(month, offset);
}
