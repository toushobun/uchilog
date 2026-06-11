import { redirect } from "next/navigation";

import { getCurrentLedgerContext } from "lib/ledger/current-ledger";
import { routePaths } from "config/paths";

export async function loadLedgersView() {
  const { currentLedger, ledgers } = await getCurrentLedgerContext();

  if (!currentLedger) {
    redirect(routePaths.ledgerSetup);
  }

  return {
    currentLedgerId: currentLedger.id,
    ledgers,
  };
}
