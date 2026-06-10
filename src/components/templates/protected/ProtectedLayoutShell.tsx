import Script from "next/script";
import type { ReactNode } from "react";

import { AppShell } from "templates/protected/AppShell";
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
      <Script
        id="user-theme-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: createUserThemeInitScript(email),
        }}
      />
      <AppShell email={email}>{children}</AppShell>
    </>
  );
}
