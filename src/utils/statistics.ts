import type { StatisticsRankItem, StatisticsViewData } from "types/statistics";
import type {
  TransactionCategoryType,
  TransactionRecordStorageType,
} from "types/transactions";
import {
  addTransactionAmount,
  createTransactionAmountSummary,
  formatMonthLabel,
  shiftMonth,
} from "utils/transactions";

type StatisticsRecordInput = {
  id: string;
  merchant_id: string | null;
  type: TransactionRecordStorageType;
};

type StatisticsItemInput = {
  amount: string;
  category_id: string | null;
  transaction_record_id: string;
};

type StatisticsMerchantInput = {
  id: string;
  name: string;
};

type StatisticsCategoryInput = {
  id: string;
  name: string;
  parent_id: string | null;
  type: TransactionCategoryType;
};

type BuildStatisticsViewDataParams = {
  categories: StatisticsCategoryInput[];
  currency: string;
  items: StatisticsItemInput[];
  ledgerName: string;
  merchants: StatisticsMerchantInput[];
  month: string;
  records: StatisticsRecordInput[];
};

type RankingAccumulator = {
  amount: number;
  id: string;
  name: string;
  transactionIds: Set<string>;
};

export function buildStatisticsViewData({
  categories,
  currency,
  items,
  ledgerName,
  merchants,
  month,
  records,
}: BuildStatisticsViewDataParams): StatisticsViewData {
  const recordById = new Map(records.map((record) => [record.id, record]));
  const merchantById = new Map(
    merchants.map((merchant) => [merchant.id, merchant]),
  );
  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );
  const summary = createTransactionAmountSummary(currency);
  const merchantRankingById = new Map<string, RankingAccumulator>();
  const categoryRankingById = new Map<string, RankingAccumulator>();

  for (const item of items) {
    const record = recordById.get(item.transaction_record_id);

    if (!record || record.type === "transfer") continue;

    const categoryId = item.category_id;

    if (!categoryId) continue;

    const category = categoryById.get(categoryId);

    if (!category) continue;

    addTransactionAmount(summary, category.type, item.amount);

    if (category.type !== "expense") continue;

    const merchantId = record.merchant_id;

    if (merchantId) {
      addRankingAmount(
        merchantRankingById,
        merchantId,
        merchantById.get(merchantId)?.name ?? "未指定商家",
        item.amount,
        record.id,
      );
    }

    addRankingAmount(
      categoryRankingById,
      categoryId,
      getCategoryDisplayName(category, categoryById),
      item.amount,
      record.id,
    );
  }

  return {
    categoryExpenseRanking: toSortedRanking(categoryRankingById),
    ledgerName,
    merchantExpenseRanking: toSortedRanking(merchantRankingById),
    month,
    monthLabel: formatMonthLabel(month),
    nextMonth: shiftMonth(month, 1),
    previousMonth: shiftMonth(month, -1),
    summary,
  };
}

function addRankingAmount(
  rankingById: Map<string, RankingAccumulator>,
  id: string,
  name: string,
  amount: string,
  transactionId: string,
) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return;

  const ranking = rankingById.get(id) ?? {
    amount: 0,
    id,
    name,
    transactionIds: new Set<string>(),
  };

  ranking.amount += value;
  ranking.transactionIds.add(transactionId);
  rankingById.set(id, ranking);
}

function getCategoryDisplayName(
  category: StatisticsCategoryInput,
  categoryById: Map<string, StatisticsCategoryInput>,
) {
  const parentCategory = category.parent_id
    ? categoryById.get(category.parent_id)
    : null;

  return parentCategory
    ? `${parentCategory.name} / ${category.name}`
    : category.name;
}

function toSortedRanking(
  rankingById: Map<string, RankingAccumulator>,
): StatisticsRankItem[] {
  return [...rankingById.values()]
    .map((ranking) => ({
      amount: String(ranking.amount),
      id: ranking.id,
      name: ranking.name,
      transactionCount: ranking.transactionIds.size,
    }))
    .sort((a, b) => {
      const amountDiff = Number(b.amount) - Number(a.amount);

      if (amountDiff !== 0) return amountDiff;

      const countDiff = b.transactionCount - a.transactionCount;

      if (countDiff !== 0) return countDiff;

      return a.name.localeCompare(b.name);
    });
}
