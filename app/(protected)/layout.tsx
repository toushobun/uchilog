import type { ReactNode } from "react";

import { getCurrentLedgerContext } from "lib/ledger/current-ledger";
import { ProtectedLayoutShell } from "templates/protected/ProtectedLayoutShell";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { email } = await getCurrentLedgerContext();

  return <ProtectedLayoutShell email={email}>{children}</ProtectedLayoutShell>;
}
