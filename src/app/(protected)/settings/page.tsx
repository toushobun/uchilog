import { redirect } from "next/navigation";

import { SettingsHome } from "settings-page/SettingsHome";
import { getCurrentLedgerContext } from "lib/ledger/current-ledger";

export default async function SettingsPage() {
  const { email, currentLedger } = await getCurrentLedgerContext();

  if (!currentLedger) {
    redirect("/ledger-setup");
  }

  return <SettingsHome currentLedgerName={currentLedger.name} email={email} />;
}
