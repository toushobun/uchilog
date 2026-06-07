import type { Metadata } from "next";
import type { ReactNode } from "react";

import { RootLayoutShell } from "root-template/RootLayoutShell";

import "./globals.css";

export const metadata: Metadata = {
  title: "UchiLog",
  description: "记账应用 UchiLog",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return <RootLayoutShell>{children}</RootLayoutShell>;
}
