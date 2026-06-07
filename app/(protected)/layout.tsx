import type { ReactNode } from "react";

import { getCurrentLedgerContext } from "lib/ledger/current-ledger";
import { ProtectedLayoutShell } from "protected-template/ProtectedLayoutShell";

type ProtectedLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const { email } = await getCurrentLedgerContext();

  return <ProtectedLayoutShell email={email}>{children}</ProtectedLayoutShell>;
}
