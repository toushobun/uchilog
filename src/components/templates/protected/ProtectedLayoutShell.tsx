import type { ReactNode } from "react";

import { AppShell } from "protected-template/AppShell";
import { createUserThemeInitScript } from "theme/userThemeInitScript";

type ProtectedLayoutShellProps = {
  children: ReactNode;
  email: string;
};

export function ProtectedLayoutShell({
  children,
  email,
}: ProtectedLayoutShellProps) {
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
