import type {
  TransactionCategoryType,
  TransactionRecordStorageType,
} from "types/transactions";

export type TransactionRecordDbRow = {
  id: string;
  type: TransactionRecordStorageType;
  transaction_at: string;
  merchant_id: string | null;
  note: string | null;
  created_by?: string | null;
  created_at: string;
};

export type TransactionItemDbRow = {
  transaction_record_id: string;
  account_id: string;
  category_id: string | null;
  amount: string;
  balance_delta?: string;
  note?: string | null;
};

export type TransactionTagDbRow = {
  id: string;
  name: string;
  color: string | null;
};

export type TransactionRecordTagDbRow = {
  tag_id: string;
};

export type AccountOptionDbRow = {
  id: string;
  name: string;
  currency: string;
};

export type CategorySummaryDbRow = {
  id: string;
  name: string;
  parent_id: string | null;
  type: TransactionCategoryType;
};

export type CategoryOptionDbRow = CategorySummaryDbRow;

export type MerchantSummaryDbRow = {
  id: string;
  name: string;
  icon_url: string | null;
};

export type AppUserSummaryDbRow = {
  id: string;
  display_name: string;
};
