import { redirect } from "next/navigation";

import { getCurrentLedgerContext } from "lib/ledger/current-ledger";

export async function loadLedgersView() {
  const { currentLedger, ledgers } = await getCurrentLedgerContext();

  if (!currentLedger) {
    redirect("/ledger-setup");
  }

  return {
    currentLedgerId: currentLedger.id,
    ledgers,
  };
}
