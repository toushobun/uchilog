import type { ReactNode } from "react";

import { getCurrentLedgerContext } from "@/lib/ledger/current-ledger";

import { AppShell } from "./app-shell";

type ProtectedLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const { email, currentLedger } = await getCurrentLedgerContext();

  return (
    <AppShell currentLedgerName={currentLedger?.name ?? null} email={email}>
      {children}
    </AppShell>
  );
}
