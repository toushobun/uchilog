import { redirect } from "next/navigation";

import { getCurrentLedgerContext } from "lib/ledger/current-ledger";
import { routePaths } from "config/paths";

export async function loadSettingsView() {
  const { currentLedger, email } = await getCurrentLedgerContext();

  if (!currentLedger) {
    redirect(routePaths.ledgerSetup);
  }

  return {
    currentLedgerName: currentLedger.name,
    email,
  };
}
