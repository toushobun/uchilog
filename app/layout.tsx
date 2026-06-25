import "./globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import { RootLayoutShell } from "templates/root/RootLayoutShell";

export const metadata: Metadata = {
  title: "KuraNote",
  description: "KuraNote 家庭生活记录工具",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <RootLayoutShell>{children}</RootLayoutShell>;
}
