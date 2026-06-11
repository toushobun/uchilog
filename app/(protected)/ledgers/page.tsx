import { loadLedgersView } from "server/loaders/ledgers";
import { LedgersTemplate } from "templates/ledgers/Ledgers";

export default async function LedgersRoute() {
  const view = await loadLedgersView();

  return <LedgersTemplate {...view} />;
}
