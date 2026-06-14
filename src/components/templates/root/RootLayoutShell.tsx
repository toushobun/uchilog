import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import type { CSSProperties, ReactNode } from "react";

import { AppProviders } from "providers/AppProviders";
import { createUserThemeBootstrapScript } from "theme/userThemeBootstrapScript";
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
      {/* 根布局允许使用原生 head；这个 bootstrap 必须在 body 绘制前执行。 */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: createUserThemeBootstrapScript() }}
        />
      </head>
      <body>
        <AppRouterCacheProvider>
          <AppProviders>{children}</AppProviders>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
