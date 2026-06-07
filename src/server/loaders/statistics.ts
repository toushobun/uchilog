import { getCurrentLedgerOrRedirect } from "lib/ledger/current-ledger";

export async function loadStatisticsView() {
  const currentLedger = await getCurrentLedgerOrRedirect();

  return {
    ledgerName: currentLedger.name,
  };
}
