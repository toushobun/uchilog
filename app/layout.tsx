import "./globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import { RootLayoutShell } from "templates/root/RootLayoutShell";

export const metadata: Metadata = {
  title: "UchiLog",
  description: "记账应用 UchiLog",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <RootLayoutShell>{children}</RootLayoutShell>;
}
