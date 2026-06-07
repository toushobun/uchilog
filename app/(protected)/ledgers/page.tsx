import { LedgersPage as LedgersPageView } from "ledgers-page/LedgersPage";
import { loadLedgersView } from "server/loaders/ledgers";

export default async function LedgersPage() {
  const view = await loadLedgersView();

  return <LedgersPageView {...view} />;
}
