import type { CurrentLedger } from "lib/ledger/current-ledger";
import type {
  AccountOptionDbRow,
  AppUserSummaryDbRow,
  CategorySummaryDbRow,
  MerchantSummaryDbRow,
  TransactionItemDbRow,
  TransactionRecordDbRow,
} from "server/db-types";

export const transactionPageSize = 20;
export const activeTransactionRecordTypes = ["normal", "transfer"] as const;

export type RawTagAssignment = {
  tag_id: string;
  transaction_record_id: string;
};

export type TransactionGroupLoaderContext = {
  accounts: AccountOptionDbRow[];
  categories: CategorySummaryDbRow[];
  currentLedger: CurrentLedger;
  items: TransactionItemDbRow[];
  merchants: MerchantSummaryDbRow[];
  records: TransactionRecordDbRow[];
  recorders: AppUserSummaryDbRow[];
  tagAssignments: RawTagAssignment[];
  tagById: Map<string, string>;
};
