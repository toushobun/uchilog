import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { cookies } from "next/headers";
import type { CSSProperties, ReactNode } from "react";

import { AppProviders } from "providers/AppProviders";
import {
  defaultUserThemeCssVariables,
  getUserThemeCssVariables,
} from "theme/userThemeCssVariables";
import { userThemeCookieName } from "theme/userThemeStorage";
import { defaultUserThemeKey, isUserThemeKey } from "theme/userThemeTokens";

type RootLayoutShellProps = {
  children: ReactNode;
};

export async function RootLayoutShell({ children }: RootLayoutShellProps) {
  const cookieStore = await cookies();
  const themeCookieValue = cookieStore.get(userThemeCookieName)?.value;
  const themeKey =
    themeCookieValue && isUserThemeKey(themeCookieValue)
      ? themeCookieValue
      : null;
  const cssVariables = themeKey
    ? getUserThemeCssVariables(themeKey)
    : defaultUserThemeCssVariables;

  return (
    <html
      lang="zh-CN"
      data-user-theme={themeKey ?? defaultUserThemeKey}
      style={cssVariables as CSSProperties}
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
