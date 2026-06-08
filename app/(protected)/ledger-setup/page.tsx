import { redirect } from "next/navigation";

import { getCurrentLedgerContext } from "lib/ledger/current-ledger";
import { routePaths } from "config/paths";
import { createLedger } from "server/actions/ledgerSetup";
import { LedgerSetupTemplate } from "templates/ledger-setup/LedgerSetup";
import { getLedgerSetupErrorMessage } from "utils/pageErrors";

export default async function LedgerSetupRoute({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { currentLedger } = await getCurrentLedgerContext();

  if (currentLedger) {
    redirect(routePaths.dashboard);
  }

  const params = await searchParams;

  return (
    <LedgerSetupTemplate
      createLedgerAction={createLedger}
      errorMessage={getLedgerSetupErrorMessage(params.error)}
    />
  );
}
