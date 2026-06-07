import { redirect } from "next/navigation";

import { getCurrentLedgerContext } from "lib/ledger/current-ledger";
import { LedgerSetupPage as LedgerSetupPageView } from "ledger-setup-page/LedgerSetupPage";
import { getLedgerSetupErrorMessage } from "utils/pageErrors";

type LedgerSetupPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LedgerSetupPage({
  searchParams,
}: LedgerSetupPageProps) {
  const { currentLedger } = await getCurrentLedgerContext();

  if (currentLedger) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <LedgerSetupPageView
      errorMessage={getLedgerSetupErrorMessage(params.error)}
    />
  );
}
