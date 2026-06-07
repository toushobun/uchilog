import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import type { CSSProperties, ReactNode } from "react";

import { AppProviders } from "providers/AppProviders";
import { createLastUserThemeInitScript } from "theme/userThemeInitScript";
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
        <script
          dangerouslySetInnerHTML={{
            __html: createLastUserThemeInitScript(),
          }}
        />
        <AppRouterCacheProvider>
          <AppProviders>{children}</AppProviders>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
