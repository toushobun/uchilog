import { getCurrentLedgerOrRedirect } from "lib/ledger/current-ledger";

export async function loadCategoriesView() {
  const currentLedger = await getCurrentLedgerOrRedirect();

  return {
    ledgerName: currentLedger.name,
  };
}
