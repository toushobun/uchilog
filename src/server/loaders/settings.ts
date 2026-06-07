import { redirect } from "next/navigation";

import { getCurrentLedgerContext } from "lib/ledger/current-ledger";

export async function loadSettingsView() {
  const { currentLedger, email } = await getCurrentLedgerContext();

  if (!currentLedger) {
    redirect("/ledger-setup");
  }

  return {
    currentLedgerName: currentLedger.name,
    email,
  };
}
