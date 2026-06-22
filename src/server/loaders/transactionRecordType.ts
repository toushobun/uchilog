import { notFound } from "next/navigation";

import { getCurrentLedgerOrRedirect } from "lib/ledger/current-ledger";
import { createClient } from "lib/supabase/server";
import type { TransactionRecordType } from "types/transactions";

const transactionRecordTypes = ["expense", "income", "transfer"] as const;

export async function loadTransactionRecordType(
  transactionRecordId: string,
): Promise<TransactionRecordType> {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transaction_record")
    .select("type")
    .eq("ledger_id", currentLedger.id)
    .eq("id", transactionRecordId)
    .eq("status", "active")
    .limit(1);

  if (error) {
    throw new Error("Failed to load transaction record type");
  }

  const rawType = ((data ?? []) as { type?: string }[])[0]?.type;
  const type = transactionRecordTypes.find((value) => value === rawType);

  if (!type) {
    notFound();
  }

  return type;
}
