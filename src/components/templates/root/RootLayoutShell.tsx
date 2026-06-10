import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import type { CSSProperties, ReactNode } from "react";

import { AppProviders } from "providers/AppProviders";
import { defaultUserThemeCssVariables } from "theme/userThemeCssVariables";

type RootLayoutShellProps = {
  children: ReactNode;
};

export function RootLayoutShell({ children }: RootLayoutShellProps) {
  return (
    <html
      lang="zh-CN"
      style={defaultUserThemeCssVariables as CSSProperties}
      suppressHydrationWarning
    >
      <body>
        <AppRouterCacheProvider>
          <AppProviders>{children}</AppProviders>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
