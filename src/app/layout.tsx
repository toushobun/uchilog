import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";

import { createLastUserThemeInitScript } from "theme/userThemeInitScript";
import { defaultUserThemeCssVariables } from "theme/userThemeCssVariables";

import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "UchiLog",
  description: "记账应用 UchiLog",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
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
          <Providers>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
