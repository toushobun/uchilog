import type { ReactNode } from "react";

import { getCurrentLedgerContext } from "lib/ledger/current-ledger";
import { createUserThemeInitScript } from "theme/userThemeInitScript";

import { AppShell } from "./app-shell";

type ProtectedLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const { email } = await getCurrentLedgerContext();

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: createUserThemeInitScript(email),
        }}
      />
      <AppShell email={email}>{children}</AppShell>
    </>
  );
}
