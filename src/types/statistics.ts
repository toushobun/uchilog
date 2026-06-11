import type { TransactionAmountSummary } from "types/transactions";

export type StatisticsRankItem = {
  amount: string;
  id: string;
  name: string;
  transactionCount: number;
};

export type StatisticsViewData = {
  categoryExpenseRanking: StatisticsRankItem[];
  ledgerName: string;
  merchantExpenseRanking: StatisticsRankItem[];
  month: string;
  monthLabel: string;
  nextMonth: string;
  previousMonth: string;
  summary: TransactionAmountSummary;
};
