import type { ReactNode } from "react";

import { AppShell } from "templates/protected/AppShell";

type ProtectedLayoutShellProps = {
  children: ReactNode;
  email: string;
};

export function ProtectedLayoutShell({
  children,
  email,
}: ProtectedLayoutShellProps) {
  return <AppShell email={email}>{children}</AppShell>;
}
