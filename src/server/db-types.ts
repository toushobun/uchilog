import type { TransactionType } from "types/transactions";

export type TransactionRecordRow = {
  id: string;
  type: TransactionType;
  transaction_at: string;
  merchant_id: string | null;
  note: string | null;
  created_by?: string | null;
  created_at: string;
};

export type TransactionItemRow = {
  transaction_record_id: string;
  account_id: string;
  category_id: string | null;
  amount: string;
  note?: string | null;
};

export type AccountRow = {
  id: string;
  name: string;
  currency: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  parent_id: string | null;
};

export type MerchantRow = {
  id: string;
  name: string;
  icon_url: string | null;
};

export type AppUserRow = {
  id: string;
  display_name: string;
};
