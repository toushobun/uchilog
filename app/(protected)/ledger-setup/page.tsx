import { redirect } from "next/navigation";

import { getCurrentLedgerContext } from "lib/ledger/current-ledger";
import { LedgerSetupPage } from "ledger-setup-page/LedgerSetup";
import { getLedgerSetupErrorMessage } from "utils/pageErrors";

type LedgerSetupRouteProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LedgerSetupRoute({
  searchParams,
}: LedgerSetupRouteProps) {
  const { currentLedger } = await getCurrentLedgerContext();

  if (currentLedger) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <LedgerSetupPage errorMessage={getLedgerSetupErrorMessage(params.error)} />
  );
}
