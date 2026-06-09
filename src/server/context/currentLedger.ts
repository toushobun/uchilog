import { redirect } from "next/navigation";

import { routePaths } from "config/paths";
import { getCurrentLedgerContext } from "lib/ledger/current-ledger";

export async function requireCurrentUserAndLedger() {
  const context = await getCurrentLedgerContext();

  if (!context.currentLedger) {
    redirect(routePaths.ledgerSetup);
  }

  return {
    currentLedger: context.currentLedger,
    userId: context.userId,
  };
}
